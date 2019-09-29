import { User, Event } from 'server/models';
import * as faker from 'faker';
import * as mongoose from 'mongoose';
import { IEvent } from 'server/models/types';

export const randomName = faker.name.findName;
export const randomFirstAndLastNames = () =>
  faker.name.firstName() + ' ' + faker.name.lastName();
export const randomEmail = faker.internet.email;

export const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export async function createRandomUser() {
  const user = await User.create({
    email: randomEmail(),
    name: randomFirstAndLastNames(),
    password: randomName(),
    events: [],
  });

  return user;
}

export async function createRandomEvent({
  userId,
  helpRequestCount,
}: {
  userId?: mongoose.Types.ObjectId | mongoose.Schema.Types.ObjectId;
  helpRequestCount?: number;
} = {}) {
  let user;

  if (!userId) {
    user = await createRandomUser();
  }

  let event = await Event.create({
    name: randomName(),
    city: randomName(),
    state: randomName(),
    attendeePassword: randomName(),
    mentorPassword: randomName(),
    endsAt: faker.date.future(randomInt(1, 4)),
    owner: user ? user._id : userId,
    helpRequests: [],
  });

  if (userId) {
    await User.findOneAndUpdate(
      { _id: userId },
      { $set: { events: [{ eventId: event._id, role: 'owner' }] } },
    ).exec();
  }

  if (helpRequestCount) {
    for (let i = 0; i < helpRequestCount; i++) {
      event = (await Event.findOneAndUpdate(
        { _id: event._id },
        {
          $push: {
            helpRequests: {
              $each: [await createRandomHelpRequest()],
              $position: 0,
            },
          },
        },
        { new: true },
      ).exec()) as IEvent;
    }
  }

  return event;
}

async function createRandomHelpRequest({
  creatorId,
  allowEmail,
  resolved,
}: {
  creatorId?: mongoose.Types.ObjectId;
  allowEmail?: boolean;
  resolved?: boolean;
} = {}) {
  return {
    _id: mongoose.Types.ObjectId(),
    creator: creatorId || (await createRandomUser())._id,
    title: randomName(),
    description: randomName(),
    location: randomName(),
    createdAt: new Date(),
    allowEmail: allowEmail || false,
    resolved: resolved || false,
  };
}
