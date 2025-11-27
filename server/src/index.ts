import app from './app';
import { connectToDatabase } from './config/database';

const PORT = Number(process.env.PORT) || 5000;

connectToDatabase(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});