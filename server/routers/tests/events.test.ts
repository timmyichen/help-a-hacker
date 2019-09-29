import App from 'server/tests/app';
import { createRandomUser, createRandomEvent } from 'server/tests/utils';
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
        createRandomEvent({ userId: userWithEvent._id }),
      ]);

      userWithEvent = (await User.findById(userWithEvent._id)) as IUser;
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
});
