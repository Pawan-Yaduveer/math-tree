import mongoose from 'mongoose';

const DEFAULT_URI = 'mongodb://localhost:27017/math-tree';

export const connectToDatabase = async (mongoUri?: string) => {
  const uri = mongoUri || process.env.MONGO_URI || DEFAULT_URI;

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};
