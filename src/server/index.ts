import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/schema';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

async function startServer() {
  const db = await initializeDatabase();

  app.use('/api/auth', authRoutes(db));
  app.use('/api/products', productRoutes(db));
  app.use('/api/orders', orderRoutes(db));

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer().catch(console.error);