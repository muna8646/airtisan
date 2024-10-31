import { Router } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { DB } from '../db/schema';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema),
});

export default function orderRoutes(db: DB) {
  // Create order
  router.post('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { items } = createOrderSchema.parse(req.body);
      
      // Calculate total and verify stock
      let total = 0;
      for (const item of items) {
        const product = await db.get(
          'SELECT price, stock FROM products WHERE id = ?',
          item.productId
        );

        if (!product) {
          return res.status(400).json({
            message: `Product ${item.productId} not found`,
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for product ${item.productId}`,
          });
        }

        total += product.price * item.quantity;
      }

      const orderId = randomUUID();

      await db.run(
        'INSERT INTO orders (id, userId, status, total) VALUES (?, ?, ?, ?)',
        [orderId, req.user!.id, 'pending', total]
      );

      for (const item of items) {
        await db.run(
          'INSERT INTO order_items (id, orderId, productId, quantity, price) VALUES (?, ?, ?, ?, ?)',
          [
            randomUUID(),
            orderId,
            item.productId,
            item.quantity,
            (await db.get('SELECT price FROM products WHERE id = ?', item.productId)).price,
          ]
        );

        // Update stock
        await db.run(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.productId]
        );
      }

      res.json({ id: orderId, total });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid input', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Server error' });
      }
    }
  });

  // Get user's orders
  router.get('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const orders = await db.all(`
        SELECT o.*, 
          json_group_array(
            json_object(
              'productId', oi.productId,
              'quantity', oi.quantity,
              'price', oi.price
            )
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.orderId
        WHERE o.userId = ?
        GROUP BY o.id
      `, req.user!.id);

      res.json(orders.map(order => ({
        ...order,
        items: JSON.parse(order.items),
      })));
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get order by ID
  router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const order = await db.get(`
        SELECT o.*, 
          json_group_array(
            json_object(
              'productId', oi.productId,
              'quantity', oi.quantity,
              'price', oi.price
            )
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.orderId
        WHERE o.id = ? AND o.userId = ?
        GROUP BY o.id
      `, [req.params.id, req.user!.id]);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json({
        ...order,
        items: JSON.parse(order.items),
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
}