import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import calcRoutes from './routes/calc';
import authRoutes from './routes/auth';

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/calc', calcRoutes);

  app.get('/', (req, res) => {
    res.send('Math Tree API is Running');
  });

  return app;
};

const app = createApp();
export default app;
