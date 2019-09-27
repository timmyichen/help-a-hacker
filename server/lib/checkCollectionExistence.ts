import { Event } from 'server/models';
import * as mongoose from 'mongoose';

export default async function() {
  if (!process.env.MONGO_URI) {
    throw new Error('Expected mongo URI');
  }

  const connection = await mongoose.createConnection(process.env.MONGO_URI, {
    useNewUrlParser: true,
  });

  const collections = await connection.db.listCollections().toArray();

  if (collections.some(c => c.name === 'events')) {
    return;
  }

  console.log('\n\nEvents collection not found, creating\n\n');

  const event = await Event.create({
    name: 'asdf',
    city: '',
    state: '',
    attendeePassword: Math.random() + '',
    mentorPassword: Math.random() + '',
  });

  await Event.deleteOne({ _id: event._id }).exec();
}
