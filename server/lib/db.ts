import * as mongoose from 'mongoose';

async function initDB() {
  if (!process.env.MONGO_URI) {
    throw new Error('Expected mongo URI');
  }

  const db = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  });

  return db;
}

export default initDB;
