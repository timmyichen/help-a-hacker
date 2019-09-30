import { User, Event } from 'server/models';
import * as faker from 'faker';
import * as mongoose from 'mongoose';
import { IEvent, Role, IUser } from 'server/models/types';
import { pick } from 'lodash';

const basicEventFields = ['name', 'city', 'state', 'endsAt'];

export type AnyId = mongoose.Schema.Types.ObjectId | mongoose.Types.ObjectId;

export const randomName = faker.name.findName;
export const randomFirstAndLastNames = () =>
  faker.name.firstName() + ' ' + faker.name.lastName();
export const randomEmail = faker.internet.email;

export function randomFutureDate() {
  return faker.date.future(randomInt(1, 4));
}

export function randomPastDate() {
  return faker.date.past(randomInt(1, 4));
}

export const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export async function createRandomUser({
  event,
}: {
  event?: {
    role: Role;
    eventId: AnyId;
  };
} = {}) {
  const user = await User.create({
    email: randomEmail(),
    name: randomFirstAndLastNames(),
    password: randomName(),
    events: event ? [event] : [],
  });

  return user;
}

export async function createRandomAttendeeOrMentor({ role }: { role: Role }) {
  const event = await createRandomEvent();
  const user = await createRandomUser({ event: { role, eventId: event._id } });
  return user;
}

export async function createRandomEvent({
  ownerId,
  helpRequestCount,
}: {
  ownerId?: AnyId;
  helpRequestCount?: number;
} = {}) {
  let user;

  if (!ownerId) {
    user = await createRandomUser();
  }

  let event = await Event.create({
    name: randomName(),
    city: randomName(),
    state: randomName(),
    attendeePassword: randomName(),
    mentorPassword: randomName(),
    endsAt: randomFutureDate(),
    owner: user ? user._id : ownerId,
    helpRequests: [],
  });

  if (ownerId) {
    await User.findOneAndUpdate(
      { _id: ownerId },
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

export async function registerUserForEvent({
  userId,
  eventId,
  role,
}: {
  userId: AnyId;
  eventId: AnyId;
  role: Role;
}) {
  if (role === 'owner') {
    throw new Error(
      'Dont set owner with registerUserForEvent, use createRandomEvent for that',
    );
  }

  await User.findOneAndUpdate(
    { _id: userId },
    { $set: { events: [{ eventId: eventId, role: 'role' }] } },
  ).exec();
}

async function createRandomHelpRequest({
  creatorId,
  allowEmail,
  resolved,
}: {
  creatorId?: AnyId;
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

export async function createRandomHelpRequestForEvent({
  eventId,
  helpRequestOwnerId,
  allowEmail,
  resolved,
  count,
}: {
  eventId: AnyId;
  helpRequestOwnerId?: AnyId;
  allowEmail?: boolean;
  resolved?: boolean;
  count: number;
}) {
  const helpRequests = await Promise.all(
    new Array(count).fill(null).map(() =>
      createRandomHelpRequest({
        creatorId: helpRequestOwnerId,
        allowEmail,
        resolved,
      }),
    ),
  );

  await Event.findOneAndUpdate(
    { _id: eventId },
    {
      $push: {
        helpRequests: {
          $each: helpRequests,
          $position: 0,
        },
      },
    },
    { new: true },
  ).exec();
}

// used when we know for sure it already exists. just casts as IEvent
export async function findEvent(id: AnyId) {
  const event = (await Event.findById(id)) as IEvent;
  return event;
}

// used when we know for sure it already exists. just casts as IUser
export async function findUser(id: AnyId) {
  const event = (await User.findById(id)) as IUser;
  return event;
}

export function toInputDateString(date: Date) {
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

export function getBasicEventFields(event: IEvent) {
  return {
    ...pick(event, basicEventFields),
    _id: String(event._id),
    endsAt:
      typeof event.endsAt === 'object'
        ? event.endsAt.toISOString()
        : event.endsAt,
  };
}
