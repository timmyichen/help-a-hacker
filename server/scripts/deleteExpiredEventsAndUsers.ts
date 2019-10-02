import 'module-alias/register';
import * as dotenv from 'dotenv';
dotenv.config();

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

  const updatedUsers = await User.updateMany(
    {},
    {
      $pull: {
        events: { eventId: { $in: eventIds } },
      },
    },
    { session },
  );

  const deletedUsers = await User.deleteMany(
    {
      $and: [
        {
          events: {
            $size: 0,
          },
        },
        {
          createdAt: { $lte: oneWeekAgo },
        },
      ],
    },
    // options for deleteMany is implemented but not typed
    // https://github.com/Automattic/mongoose/pull/7860/files
    // @ts-ignore
    { session },
  );

  const deletedEvents = await Event.deleteMany(
    {
      endsAt: { $lte: oneWeekAgo },
    },
    // same as above
    // @ts-ignore
    { session },
  );

  await session.commitTransaction();

  console.log(`success deleteExpiredEventsAndUsers since ${oneWeekAgo}`);
  console.log(
    [
      `updated users: ${updatedUsers.nModified - deletedUsers.deletedCount}`,
      `deleted users: ${deletedUsers.deletedCount}`,
      `deleted events: ${deletedEvents.deletedCount}`,
    ].join('\n'),
  );
}

deleteExpiredEventsAndUsers().then(() => process.exit(0));
