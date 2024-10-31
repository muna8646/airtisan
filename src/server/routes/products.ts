import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { DB } from '../db/schema';
import { AuthRequest, authMiddleware, artisanMiddleware } from '../middleware/auth';

const router = Router();
const upload = multer({ dest: 'uploads/' });

const productSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  category: z.string(),
  stock: z.number().int().nonnegative(),
});

export default function productRoutes(db: DB) {
  // Create product
  router.post('/', 
    authMiddleware,
    artisanMiddleware,
    upload.array('images', 5),
    async (req: AuthRequest, res) => {
      try {
        const productData = productSchema.parse({
          ...req.body,
          price: Number(req.body.price),
          stock: Number(req.body.stock),
        });

        const productId = randomUUID();
        const files = req.files as Express.Multer.File[];

        await db.run(
          `INSERT INTO products (id, title, description, price, category, artisanId, stock)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            productId,
            productData.title,
            productData.description,
            productData.price,
            productData.category,
            req.user!.id,
            productData.stock,
          ]
        );

        // Save product images
        for (const file of files) {
          await db.run(
            'INSERT INTO product_images (id, productId, url) VALUES (?, ?, ?)',
            [randomUUID(), productId, file.path]
          );
        }

        res.json({ id: productId });
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ message: 'Invalid input', errors: error.errors });
        } else {
          res.status(500).json({ message: 'Server error' });
        }
      }
    }
  );

  // Get all products
  router.get('/', async (req, res) => {
    try {
      const products = await db.all(`
        SELECT p.*, GROUP_CONCAT(pi.url) as images
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.productId
        GROUP BY p.id
      `);

      res.json(products.map(product => ({
        ...product,
        images: product.images ? product.images.split(',') : [],
      })));
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get product by ID
  router.get('/:id', async (req, res) => {
    try {
      const product = await db.get(`
        SELECT p.*, GROUP_CONCAT(pi.url) as images
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.productId
        WHERE p.id = ?
        GROUP BY p.id
      `, req.params.id);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json({
        ...product,
        images: product.images ? product.images.split(',') : [],
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Update product
  router.put('/:id',
    authMiddleware,
    artisanMiddleware,
    async (req: AuthRequest, res) => {
      try {
        const product = await db.get(
          'SELECT artisanId FROM products WHERE id = ?',
          req.params.id
        );

        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }

        if (product.artisanId !== req.user!.id) {
          return res.status(403).json({ message: 'Not authorized' });
        }

        const productData = productSchema.parse({
          ...req.body,
          price: Number(req.body.price),
          stock: Number(req.body.stock),
        });

        await db.run(
          `UPDATE products 
           SET title = ?, description = ?, price = ?, category = ?, stock = ?
           WHERE id = ?`,
          [
            productData.title,
            productData.description,
            productData.price,
            productData.category,
            productData.stock,
            req.params.id,
          ]
        );

        res.json({ message: 'Product updated' });
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ message: 'Invalid input', errors: error.errors });
        } else {
          res.status(500).json({ message: 'Server error' });
        }
      }
    }
  );

  // Delete product
  router.delete('/:id',
    authMiddleware,
    artisanMiddleware,
    async (req: AuthRequest, res) => {
      try {
        const product = await db.get(
          'SELECT artisanId FROM products WHERE id = ?',
          req.params.id
        );

        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }

        if (product.artisanId !== req.user!.id) {
          return res.status(403).json({ message: 'Not authorized' });
        }

        await db.run('DELETE FROM product_images WHERE productId = ?', req.params.id);
        await db.run('DELETE FROM products WHERE id = ?', req.params.id);

        res.json({ message: 'Product deleted' });
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }
    }
  );

  return router;
}