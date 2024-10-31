import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { DB } from '../db/schema';
import { randomUUID } from 'crypto';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  isArtisan: z.boolean(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default function authRoutes(db: DB) {
  router.post('/register', async (req, res) => {
    try {
      const { name, email, password, isArtisan } = registerSchema.parse(req.body);
      
      const existingUser = await db.get('SELECT id FROM users WHERE email = ?', email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = randomUUID();

      await db.run(
        'INSERT INTO users (id, name, email, password, isArtisan) VALUES (?, ?, ?, ?, ?)',
        [userId, name, email, hashedPassword, isArtisan]
      );

      const token = jwt.sign(
        { id: userId, email, isArtisan },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid input', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Server error' });
      }
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await db.get('SELECT * FROM users WHERE email = ?', email);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, isArtisan: user.isArtisan },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid input', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Server error' });
      }
    }
  });

  return router;
}