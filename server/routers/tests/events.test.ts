import App from 'server/tests/app';
import {
  createRandomUser,
  createRandomEvent,
  createRandomAttendeeOrMentor,
  findEvent,
  createRandomHelpRequestForEvent,
  getBasicEventFields,
  randomName,
  toInputDateString,
  randomFutureDate,
  randomPastDate,
  findUser,
  registerUserForEvent,
} from 'server/tests/utils';
import { IUser, IEvent } from 'server/models/types';
import eventsRouter from 'server/routers/events';
import { User } from 'server/models';

describe('events router', () => {
  const app = new App();

  beforeAll(async () => {
    app.setRouter(eventsRouter);
    await app.initialize();
  });

  afterAll(async () => {
    await app.destroy();
  });

  describe('/api/events/find', () => {
    let user: IUser;
    let event: IEvent;

    beforeAll(async () => {
      user = await createRandomUser();

      event = await createRandomEvent();
    });

    it('errors on no auth', async () => {
      app.logout();

      await app.request.get('/api/events/find').expect(401);
    });

    it('errors if missing code or role', async () => {
      app.login(user);

      await app.request
        .get(`/api/events/find?code=${event.attendeePassword}`)
        .expect(400);

      await app.request.get('/api/events/find?role=attendee').expect(400);
    });

    it('errors if event via code cant be found', async () => {
      app.login(user);

      await app.request
        .get(`/api/events/find?role=attendee&code=${event.mentorPassword}`)
        .expect(404);
    });

    it('finds the event given a correct role and code', async () => {
      app.login(user);

      const res = await app.request
        .get(`/api/events/find?role=attendee&code=${event.attendeePassword}`)
        .expect(200);

      const endsAt = new Date(
        event.endsAt.getTime() - event.endsAt.getTimezoneOffset() * 60000,
      ).toISOString();

      expect(res.body).toEqual({
        _id: String(event._id),
        name: event.name,
        city: event.city,
        state: event.state,
        endsAt,
      });
    });
  });

  describe('/api/events/register', () => {
    let user: IUser;
    let userWithEvent: IUser;
    let event: IEvent;

    beforeAll(async () => {
      [user, userWithEvent] = await Promise.all([
        createRandomUser(),
        createRandomUser(),
      ]);

      [event] = await Promise.all([
        createRandomEvent(),
        createRandomEvent({ ownerId: userWithEvent._id }),
      ]);

      userWithEvent = await findUser(userWithEvent._id);
    });

    it('errors on no auth', async () => {
      app.logout();

      await app.request
        .post('/api/events/register')
        .send({
          eventId: event._id,
          role: 'attendee',
          code: event.attendeePassword,
        })
        .expect(401);
    });

    it('errors if the user already belongs to an event', async () => {
      app.login(userWithEvent);

      await app.request
        .post('/api/events/register')
        .send({
          eventId: event._id,
          role: 'attendee',
          code: event.attendeePassword,
        })
        .expect(400);
    });

    it('errors if the event doesnt exist', async () => {
      app.login(user);

      await app.request
        .post('/api/events/register')
        .send({
          eventId: user._id,
          role: 'attendee',
          code: event.attendeePassword,
        })
        .expect(404);
    });

    it('errors if the code is mismatched', async () => {
      app.login(user);

      await app.request
        .post('/api/events/register')
        .send({
          eventId: event._id,
          role: 'mentor',
          code: event.attendeePassword,
        })
        .expect(400);
    });

    it('successfully registers for an event', async () => {
      app.login(user);

      await app.request
        .post('/api/events/register')
        .send({
          eventId: event._id,
          role: 'attendee',
          code: event.attendeePassword,
        })
        .expect(200);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser && updatedUser.events[0].eventId).toEqual(event._id);
      expect(updatedUser && updatedUser.events[0].role).toEqual('attendee');
    });
  });

  describe('/api/events/:id', () => {
    let mentor: IUser;
    let attendee: IUser;
    let owner: IUser;
    let mentorEvent: IEvent;
    let attendeeEvent: IEvent;
    let ownerEvent: IEvent;

    beforeAll(async () => {
      [mentor, attendee, owner] = await Promise.all([
        createRandomAttendeeOrMentor({ role: 'mentor' }),
        createRandomAttendeeOrMentor({ role: 'attendee' }),
        createRandomUser(),
      ]);

      [attendeeEvent, mentorEvent, ownerEvent] = await Promise.all([
        findEvent(attendee.events[0].eventId),
        findEvent(mentor.events[0].eventId),
        createRandomEvent({ ownerId: owner._id, helpRequestCount: 3 }),
      ]);

      await Promise.all([
        createRandomHelpRequestForEvent({ eventId: mentorEvent._id, count: 2 }),
        createRandomHelpRequestForEvent({
          eventId: mentorEvent._id,
          count: 1,
          resolved: true,
        }),
        createRandomHelpRequestForEvent({
          eventId: attendeeEvent._id,
          count: 1,
          helpRequestOwnerId: attendee._id,
        }),
        createRandomHelpRequestForEvent({
          eventId: attendeeEvent._id,
          count: 1,
          helpRequestOwnerId: attendee._id,
          resolved: true,
        }),
        createRandomHelpRequestForEvent({
          eventId: attendeeEvent._id,
          count: 3,
        }),
      ]);

      owner = (await User.findById(owner._id)) as IUser;
    });

    it('errors on no auth', async () => {
      app.logout();

      await app.request.get(`/api/events/${mentorEvent._id}`).expect(401);
    });

    it('errors if the event doesnt exist', async () => {
      app.login(mentor);

      await app.request.get(`/api/events/${owner._id}`).expect(404);
    });

    it('errors if the event isnt owned by the user', async () => {
      app.login(mentor);

      await app.request.get(`/api/events/${ownerEvent._id}`).expect(404);
    });

    it('returns the correct (resolved only) info for a mentor', async () => {
      app.login(mentor);

      const res = await app.request
        .get(`/api/events/${mentorEvent._id}`)
        .expect(200);

      expect(getBasicEventFields(res.body)).toEqual(
        getBasicEventFields(mentorEvent),
      );

      expect(res.body.helpRequests.length).toBe(2);
    });

    it('returns the correct (unresolved) info for a mentor', async () => {
      app.login(mentor);

      const res = await app.request
        .get(`/api/events/${mentorEvent._id}?showResolved=1`)
        .expect(200);

      expect(getBasicEventFields(res.body)).toEqual(
        getBasicEventFields(mentorEvent),
      );
      expect(res.body.role).toBe('mentor');

      expect(res.body.helpRequests.length).toBe(3);
    });

    it('returns the correct info for an attendee', async () => {
      app.login(attendee);

      const res = await app.request
        .get(`/api/events/${attendeeEvent._id}`)
        .expect(200);

      expect(getBasicEventFields(res.body)).toEqual(
        getBasicEventFields(attendeeEvent),
      );

      expect(res.body.helpRequests.length).toBe(2);
    });

    it('the showResolved flag does nothing for an attendee', async () => {
      app.login(attendee);

      const res = await app.request
        .get(`/api/events/${attendeeEvent._id}?showResolved=1`)
        .expect(200);

      expect(getBasicEventFields(res.body)).toEqual(
        getBasicEventFields(attendeeEvent),
      );
      expect(res.body.role).toBe('attendee');

      expect(res.body.helpRequests.length).toBe(2);
    });

    it('returns the correct info for an owner', async () => {
      app.login(owner);

      const res = await app.request
        .get(`/api/events/${ownerEvent._id}`)
        .expect(200);

      expect(getBasicEventFields(res.body)).toEqual(
        getBasicEventFields(ownerEvent),
      );
      expect(res.body.role).toBe('owner');

      expect(res.body.attendeePassword).toBe(ownerEvent.attendeePassword);
      expect(res.body.mentorPassword).toBe(ownerEvent.mentorPassword);

      expect(res.body.helpRequests.length).toBe(3);
    });
  });

  describe('/api/events/create', () => {
    let user: IUser;
    let userWithEvent: IUser;

    beforeAll(async () => {
      [user, userWithEvent] = await Promise.all([
        createRandomUser(),
        createRandomUser(),
      ]);

      await createRandomEvent({ ownerId: userWithEvent._id });
      userWithEvent = await findUser(userWithEvent._id);
    });

    it('errors on no auth', async () => {
      app.logout();

      await app.request
        .post('/api/events/create')
        .send({
          name: randomName(),
          endDate: toInputDateString(randomFutureDate()),
        })
        .expect(401);
    });

    it('errors on missing fields', async () => {
      app.login(user);

      await app.request
        .post('/api/events/create')
        .send({
          endDate: toInputDateString(randomFutureDate()),
        })
        .expect(400);
    });

    it('errors if they already belong to an event', async () => {
      app.login(userWithEvent);

      await app.request
        .post('/api/events/create')
        .send({
          name: randomName(),
          endDate: toInputDateString(randomFutureDate()),
        })
        .expect(400);
    });

    it('errors on invalid date', async () => {
      app.login(user);

      await app.request
        .post('/api/events/create')
        .send({
          name: randomName(),
          endDate: 'asdf',
        })
        .expect(400);
    });

    it('errors on past date', async () => {
      app.login(user);

      await app.request
        .post('/api/events/create')
        .send({
          name: randomName(),
          endDate: toInputDateString(randomPastDate()),
        })
        .expect(400);
    });

    it('creates an event', async () => {
      app.login(user);

      const res = await app.request
        .post('/api/events/create')
        .send({
          name: randomName(),
          city: randomName(),
          state: randomName(),
          endDate: toInputDateString(randomFutureDate()),
        })
        .expect(200);

      const event = await findEvent(res.body._id);

      expect(res.body).toEqual({
        ...getBasicEventFields(event),
        attendeePassword: event.attendeePassword,
        mentorPassword: event.mentorPassword,
        _id: String(event._id),
      });
    });
  });

  describe('/api/events/update', () => {
    let userWithEvent: IUser;
    let mentor: IUser;
    let otherUserWithEvent: IUser;
    let event: IEvent;

    beforeAll(async () => {
      [userWithEvent, mentor, otherUserWithEvent] = await Promise.all([
        createRandomUser(),
        createRandomUser(),
        createRandomUser(),
      ]);

      [event] = await Promise.all([
        createRandomEvent({ ownerId: userWithEvent._id }),
        createRandomEvent({ ownerId: otherUserWithEvent._id }),
      ]);

      await registerUserForEvent({
        userId: mentor._id,
        eventId: event._id,
        role: 'mentor',
      });

      [userWithEvent, mentor, otherUserWithEvent] = await Promise.all([
        findUser(userWithEvent._id),
        findUser(mentor._id),
        findUser(otherUserWithEvent._id),
      ]);
    });

    it('errors on no auth', async () => {
      app.logout();

      await app.request
        .post('/api/events/update')
        .send({
          eventId: event._id,
          name: randomName(),
          endDate: toInputDateString(randomFutureDate()),
        })
        .expect(401);
    });

    it('errors on missing fields', async () => {
      app.login(userWithEvent);

      await app.request
        .post('/api/events/update')
        .send({
          eventId: event._id,
          endDate: toInputDateString(randomFutureDate()),
        })
        .expect(400);
    });

    it('errors if they do not belong to the event', async () => {
      app.login(otherUserWithEvent);

      await app.request
        .post('/api/events/update')
        .send({
          eventId: event._id,
          name: randomName(),
          endDate: toInputDateString(randomFutureDate()),
        })
        .expect(404);
    });

    it('errors they belong to the event but not as the owner', async () => {
      app.login(mentor);

      await app.request
        .post('/api/events/update')
        .send({
          eventId: event._id,
          name: randomName(),
          endDate: toInputDateString(randomFutureDate()),
        })
        .expect(404);
    });

    it('errors on invalid date', async () => {
      app.login(userWithEvent);

      await app.request
        .post('/api/events/update')
        .send({
          eventId: event._id,
          name: randomName(),
          endDate: 'asdf',
        })
        .expect(400);
    });

    it('errors on past date', async () => {
      app.login(userWithEvent);

      await app.request
        .post('/api/events/update')
        .send({
          eventId: event._id,
          name: randomName(),
          endDate: toInputDateString(randomPastDate()),
        })
        .expect(400);
    });

    it('updates an event', async () => {
      app.login(userWithEvent);

      const updateFields = {
        _id: event._id,
        name: randomName(),
        city: randomName(),
        state: randomName(),
        endsAt: randomFutureDate(),
      };

      await app.request
        .post('/api/events/update')
        .send({
          ...updateFields,
          eventId: event._id,
          endDate: toInputDateString(updateFields.endsAt),
        })
        .expect(200);

      const newEvent = await findEvent(event._id);

      expect({
        _id: event._id,
        name: updateFields.name,
        city: updateFields.city,
        state: updateFields.state,
        endsAt: toInputDateString(updateFields.endsAt),
      }).toEqual({
        _id: newEvent._id,
        name: newEvent.name,
        city: newEvent.city,
        state: newEvent.state,
        endsAt: toInputDateString(newEvent.endsAt),
      });
    });
  });

  describe('/api/events/delete', () => {
    let userWithEvent: IUser;
    let mentor: IUser;
    let otherUserWithEvent: IUser;
    let event: IEvent;

    beforeAll(async () => {
      [userWithEvent, mentor, otherUserWithEvent] = await Promise.all([
        createRandomUser(),
        createRandomUser(),
        createRandomUser(),
      ]);

      [event] = await Promise.all([
        createRandomEvent({ ownerId: userWithEvent._id }),
        createRandomEvent({ ownerId: otherUserWithEvent._id }),
      ]);

      await registerUserForEvent({
        userId: mentor._id,
        eventId: event._id,
        role: 'mentor',
      });

      [userWithEvent, mentor, otherUserWithEvent] = await Promise.all([
        findUser(userWithEvent._id),
        findUser(mentor._id),
        findUser(otherUserWithEvent._id),
      ]);
    });

    it('errors on no auth', async () => {
      app.logout();

      await app.request
        .post('/api/events/delete')
        .send({ eventId: event._id })
        .expect(401);
    });

    it('errors on missing event', async () => {
      app.login(userWithEvent);

      await app.request
        .post('/api/events/delete')
        .send({ eventId: mentor._id })
        .expect(404);
    });

    it('errors if they do not belong to the event', async () => {
      app.login(otherUserWithEvent);

      await app.request
        .post('/api/events/delete')
        .send({ eventId: event._id })
        .expect(404);
    });

    it('errors they belong to the event but not as the owner', async () => {
      app.login(mentor);

      await app.request
        .post('/api/events/delete')
        .send({ eventId: event._id })
        .expect(404);
    });

    it('deletes an event', async () => {
      app.login(userWithEvent);

      await app.request
        .post('/api/events/delete')
        .send({ eventId: event._id })
        .expect(200);

      const deletedEvent = await findEvent(event._id);

      expect(deletedEvent).toBeFalsy();
    });
  });
});
