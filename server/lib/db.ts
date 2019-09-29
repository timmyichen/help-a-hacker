import * as mongoose from 'mongoose';

async function initDB(uri: string = '') {
  if (!process.env.MONGO_URI) {
    throw new Error('Expected mongo URI');
  }

  const db = await mongoose.connect(uri || process.env.MONGO_URI, {
    useNewUrlParser: true,
  });

  return db;
}

export default initDB;
