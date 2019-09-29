require('dotenv').config();
const mongoose = require('mongoose');

if (!process.env.MONGO_URI_TEST) {
  throw new Error('expected MONGO_URI_TEST');
}

const setup = async () => {
  const db = await mongoose.connect(process.env.MONGO_URI_TEST, {
    useNewUrlParser: true,
  });

  try {
    await db.connection.db.dropCollection('users');
  } catch (e) {
    console.log(e.message);
    console.log(
      'Errored trying to drop users, probably because it doesnt exist',
    );
  }

  try {
    await db.connection.db.dropCollection('events');
  } catch (e) {
    console.log(e.message);
    console.log(
      'Errored trying to drop events, probably because it doesnt exist',
    );
  }

  console.log('\nDropped users and events collections\n');
};

setup().then(() => {
  console.log('Setup complete');
  process.exit(0);
});
