import App from 'server/tests/app';
import helpRequestsRouter from 'server/routers/helpRequests';
import {
  createRandomUser,
  createRandomEvent,
  findUser,
  randomName,
  findEvent,
  createRandomHelpRequestForEvent,
  registerUserForEvent,
} from 'server/tests/utils';
import { pick } from 'lodash';
import { IUser, IEvent, HelpRequest } from 'server/models/types';

describe('helpRequests router', () => {
  const app = new App();

  beforeAll(async () => {
    app.setRouter(helpRequestsRouter);
    await app.initialize();
  });

  afterAll(async () => {
    await app.destroy();
  });

  describe('/api/help-requests/create', () => {
    let user: IUser;
    let event: IEvent;
    let otherEvent: IEvent;

    const postFields = {
      title: randomName(),
      description: randomName(),
      location: randomName(),
      allowEmail: true,
    };

    beforeAll(async () => {
      user = await createRandomUser();
      [event, otherEvent] = await Promise.all([
        createRandomEvent(),
        createRandomEvent(),
      ]);

      await registerUserForEvent({
        eventId: event._id,
        userId: user._id,
        role: 'attendee',
      });

      user = await findUser(user._id);
    });

    it('errors on no auth', async () => {
      app.logout();

      await app.request
        .post('/api/help-requests/create')
        .send({ eventId: event._id, ...postFields })
        .expect(401);
    });

    it('errors on a nonexistent event', async () => {
      app.login(user);

      await app.request
        .post('/api/help-requests/create')
        .send({ eventId: user._id, ...postFields })
        .expect(404);
    });

    it('errors on an event they dont belong to', async () => {
      app.login(user);

      await app.request
        .post('/api/help-requests/create')
        .send({ eventId: otherEvent._id, ...postFields })
        .expect(404);
    });

    it('errors on missing fields', async () => {
      app.login(user);

      await app.request
        .post('/api/help-requests/create')
        .send({ eventId: event._id, ...postFields, description: '' })
        .expect(400);
    });

    it('creates the help request', async () => {
      app.login(user);

      const res = await app.request
        .post('/api/help-requests/create')
        .send({
          ...postFields,
          eventId: event._id,
        })
        .expect(200);

      const updatedEvent = await findEvent(event._id);

      expect(updatedEvent.helpRequests.length).toBe(1);
      const createdHelpRequest = updatedEvent.helpRequests[0];

      expect(res.body.helpRequest).toEqual({
        _id: String(createdHelpRequest._id),
        ...pick(postFields, ['title', 'description', 'location', 'allowEmail']),
        creator: {
          name: user.name,
          email: user.email,
        },
        createdAt: createdHelpRequest.createdAt.toISOString(),
        resolved: false,
      });
    });
  });

  describe('/api/help-requests/update', () => {
    let user: IUser;
    let event: IEvent;
    let otherEvent: IEvent;
    let helpRequest: HelpRequest;
    let unownedHelpRequest: HelpRequest;
    let otherHelpRequest: HelpRequest;

    const postFields = {
      title: randomName(),
      description: randomName(),
      location: randomName(),
      allowEmail: true,
    };

    beforeAll(async () => {
      user = await createRandomUser();
      [event, otherEvent] = await Promise.all([
        createRandomEvent(),
        createRandomEvent(),
      ]);

      await registerUserForEvent({
        eventId: event._id,
        userId: user._id,
        role: 'attendee',
      });

      [user] = await Promise.all([
        findUser(user._id),
        createRandomHelpRequestForEvent({
          eventId: event._id,
          helpRequestOwnerId: user._id,
          count: 1,
        }),
        createRandomHelpRequestForEvent({
          eventId: event._id,
          count: 1,
        }),
        createRandomHelpRequestForEvent({
          eventId: otherEvent._id,
          count: 1,
        }),
      ]);

      [event, otherEvent] = await Promise.all([
        findEvent(event._id),
        findEvent(otherEvent._id),
      ]);

      helpRequest = event.helpRequests.find(
        req => String(req.creator) === String(user._id),
      ) as HelpRequest;
      unownedHelpRequest = event.helpRequests.find(
        req => String(req.creator) !== String(user._id),
      ) as HelpRequest;
      otherHelpRequest = otherEvent.helpRequests[0];
    });

    it('errors on no auth', async () => {
      app.logout();

      await app.request
        .post('/api/help-requests/update')
        .send({
          helpRequestId: helpRequest._id,
          eventId: event._id,
          ...postFields,
        })
        .expect(401);
    });

    it('errors on a nonexistent event', async () => {
      app.login(user);

      await app.request
        .post('/api/help-requests/update')
        .send({
          helpRequestId: helpRequest._id,
          eventId: user._id,
          ...postFields,
        })
        .expect(404);
    });

    it('errors on an event they dont belong to', async () => {
      app.login(user);

      await app.request
        .post('/api/help-requests/update')
        .send({
          helpRequestId: otherHelpRequest._id,
          eventId: otherEvent._id,
          ...postFields,
        })
        .expect(404);
    });

    it('errors on missing fields', async () => {
      app.login(user);

      await app.request
        .post('/api/help-requests/update')
        .send({
          helpRequestId: helpRequest._id,
          eventId: event._id,
          ...postFields,
          title: '',
        })
        .expect(400);
    });

    it('errors on unowned help request', async () => {
      app.login(user);

      await app.request
        .post('/api/help-requests/update')
        .send({
          helpRequestId: unownedHelpRequest._id,
          eventId: event._id,
          ...postFields,
        })
        .expect(404);
    });

    it('updates the help request', async () => {
      app.login(user);

      const res = await app.request
        .post('/api/help-requests/update')
        .send({
          ...postFields,
          eventId: event._id,
          helpRequestId: helpRequest._id,
        })
        .expect(200);

      const updatedEvent = await findEvent(event._id);

      expect(
        updatedEvent.helpRequests.filter(
          req => String(req.creator) === String(user._id),
        ).length,
      ).toBe(1);
      const createdHelpRequest = updatedEvent.helpRequests.find(
        req => String(req.creator) === String(user._id),
      ) as HelpRequest;

      expect(res.body.helpRequest).toEqual({
        _id: String(createdHelpRequest._id),
        ...pick(postFields, ['title', 'description', 'location', 'allowEmail']),
        creator: {
          name: user.name,
          email: user.email,
        },
        createdAt: createdHelpRequest.createdAt.toISOString(),
        resolved: false,
      });
    });
  });

  describe('/api/help-requests/set-resolved', () => {
    let attendee: IUser;
    let mentor: IUser;
    let event: IEvent;
    let otherEvent: IEvent;
    let resolvedHelpRequest: HelpRequest;
    let unresolvedHelpRequest: HelpRequest;
    let resolvedUnownedHelpRequest: HelpRequest;
    let unresolvedUnownedHelpRequest: HelpRequest;
    let otherHelpRequest: HelpRequest;

    beforeAll(async () => {
      [attendee, mentor] = await Promise.all([
        createRandomUser(),
        createRandomUser(),
      ]);
      [event, otherEvent] = await Promise.all([
        createRandomEvent(),
        createRandomEvent(),
      ]);

      await Promise.all([
        registerUserForEvent({
          eventId: event._id,
          userId: attendee._id,
          role: 'attendee',
        }),
        registerUserForEvent({
          eventId: event._id,
          userId: mentor._id,
          role: 'mentor',
        }),
      ]);

      [attendee, mentor] = await Promise.all([
        findUser(attendee._id),
        findUser(mentor._id),
        createRandomHelpRequestForEvent({
          eventId: event._id,
          helpRequestOwnerId: attendee._id,
          count: 1,
          resolved: true,
        }),
        createRandomHelpRequestForEvent({
          eventId: event._id,
          helpRequestOwnerId: attendee._id,
          count: 1,
          resolved: false,
        }),
        createRandomHelpRequestForEvent({
          eventId: event._id,
          count: 1,
          resolved: true,
        }),
        createRandomHelpRequestForEvent({
          eventId: event._id,
          count: 1,
          resolved: false,
        }),
        createRandomHelpRequestForEvent({
          eventId: otherEvent._id,
          count: 1,
        }),
      ]);

      [event, otherEvent] = await Promise.all([
        findEvent(event._id),
        findEvent(otherEvent._id),
      ]);

      resolvedHelpRequest = event.helpRequests.find(
        req => String(req.creator) === String(attendee._id) && req.resolved,
      ) as HelpRequest;
      unresolvedHelpRequest = event.helpRequests.find(
        req => String(req.creator) === String(attendee._id) && !req.resolved,
      ) as HelpRequest;
      resolvedUnownedHelpRequest = event.helpRequests.find(
        req => String(req.creator) !== String(attendee._id) && req.resolved,
      ) as HelpRequest;
      unresolvedUnownedHelpRequest = event.helpRequests.find(
        req => String(req.creator) !== String(attendee._id) && !req.resolved,
      ) as HelpRequest;
      otherHelpRequest = otherEvent.helpRequests[0];
    });

    it('errors on no auth', async () => {
      app.logout();

      await app.request
        .post('/api/help-requests/set-resolved')
        .send({
          helpRequestId: unresolvedHelpRequest._id,
          eventId: event._id,
          newStatus: true,
        })
        .expect(401);
    });

    it('errors on nonexistent event', async () => {
      app.login(attendee);

      await app.request
        .post('/api/help-requests/set-resolved')
        .send({
          helpRequestId: otherHelpRequest._id,
          eventId: mentor._id,
          newStatus: true,
        })
        .expect(404);
    });

    it('errors on event that doesnt belong to user', async () => {
      app.login(attendee);

      await app.request
        .post('/api/help-requests/set-resolved')
        .send({
          helpRequestId: otherHelpRequest._id,
          eventId: otherEvent._id,
          newStatus: true,
        })
        .expect(404);
    });

    it('errors on attendee trying to resolve someone elses req', async () => {
      app.login(attendee);

      await app.request
        .post('/api/help-requests/set-resolved')
        .send({
          helpRequestId: unresolvedUnownedHelpRequest._id,
          eventId: event._id,
          newStatus: true,
        })
        .expect(401);
    });

    it('resolves an owned help request as an attendee', async () => {
      app.login(attendee);

      await app.request
        .post('/api/help-requests/set-resolved')
        .send({
          helpRequestId: unresolvedHelpRequest._id,
          eventId: event._id,
          newStatus: true,
        })
        .expect(200);

      const updatedEvent = await findEvent(event._id);

      const helpRequest = updatedEvent.helpRequests.find(
        req =>
          String(req._id) === String(unresolvedHelpRequest._id) && req.resolved,
      );
      expect(helpRequest).toBeTruthy();
    });

    it('unresolves an owned help request as an attendee', async () => {
      app.login(attendee);

      await app.request
        .post('/api/help-requests/set-resolved')
        .send({
          helpRequestId: resolvedHelpRequest._id,
          eventId: event._id,
          newStatus: false,
        })
        .expect(200);

      const updatedEvent = await findEvent(event._id);

      const helpRequest = updatedEvent.helpRequests.find(
        req =>
          String(req._id) === String(resolvedHelpRequest._id) && !req.resolved,
      );
      expect(helpRequest).toBeTruthy();
    });

    it('unresolves a help request as a mentor', async () => {
      app.login(mentor);

      await app.request
        .post('/api/help-requests/set-resolved')
        .send({
          helpRequestId: resolvedUnownedHelpRequest._id,
          eventId: event._id,
          newStatus: false,
        })
        .expect(200);

      const updatedEvent = await findEvent(event._id);

      const helpRequest = updatedEvent.helpRequests.find(
        req =>
          String(req._id) === String(resolvedUnownedHelpRequest._id) &&
          !req.resolved,
      );
      expect(helpRequest).toBeTruthy();
    });

    it('unresolves a help request as a mentor', async () => {
      app.login(mentor);

      await app.request
        .post('/api/help-requests/set-resolved')
        .send({
          helpRequestId: unresolvedUnownedHelpRequest._id,
          eventId: event._id,
          newStatus: true,
        })
        .expect(200);

      const updatedEvent = await findEvent(event._id);

      const helpRequest = updatedEvent.helpRequests.find(
        req =>
          String(req._id) === String(unresolvedUnownedHelpRequest._id) &&
          req.resolved,
      );
      expect(helpRequest).toBeTruthy();
    });
  });
});
