import initDB from 'server/lib/db';
import { Event, User } from 'server/models';

async function deleteExpiredEventsAndUsers() {
  const db = await initDB();

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(new Date().getDate() - 7);

  const session = await db.startSession();
  session.startTransaction();

  const expiredEvents = await Event.find({});

  const eventIds = expiredEvents.map(e => e._id);

  await User.updateMany(
    {},
    {
      events: {
        $pullAll: { _id: eventIds },
      },
    },
    { session },
  );

  await User.deleteMany(
    {
      events: {
        $size: 0,
      },
    },
    // options for deleteMany is implemented but not typed
    // https://github.com/Automattic/mongoose/pull/7860/files
    // @ts-ignore
    { session },
  );

  await Event.deleteMany(
    {
      endsAt: { $gte: oneWeekAgo },
    },
    // same as above
    // @ts-ignore
    { session },
  );

  await session.commitTransaction();

  console.log(`success deleteExpiredEventsAndUsers since ${oneWeekAgo}`);
}

deleteExpiredEventsAndUsers().then(() => process.exit(0));
