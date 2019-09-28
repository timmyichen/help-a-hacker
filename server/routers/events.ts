import * as express from 'express';
import * as mongoose from 'mongoose';
import * as asyncHandler from 'express-async-handler';
import { requiresAuth } from 'server/middleware/auth';
import { Event, User } from 'server/models';
import { ReqWithUser } from './auth';
import { pick } from 'lodash';
import { genEventCodes } from 'server/lib/codeGeneration';
import * as validator from 'validator';
import { NotFoundError, BadRequestError } from 'express-response-errors';
import { RenderedEvent } from 'server/models/types';

const router = express.Router();

router.get(
  '/api/events/find',
  requiresAuth({ error: true }),
  asyncHandler(async (req: ReqWithUser, res: express.Response) => {
    const { code, role } = req.query;

    if (!code || !role) {
      throw new BadRequestError('missing code or role');
    }

    const field = role === 'mentor' ? 'mentorPassword' : 'attendeePassword';

    const event = await Event.findOne({
      [field]: code,
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    res.json(pick(event, ['_id', 'name', 'city', 'state', 'endsAt']));
  }),
);

router.post(
  '/api/events/register',
  requiresAuth({ error: true }),
  asyncHandler(async (req: ReqWithUser, res: express.Response) => {
    const { eventId, role } = req.body;

    if (req.user.events.length) {
      throw new BadRequestError('You already belong to an event');
    }

    const event = await Event.findById(eventId);

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    await User.updateOne(
      { _id: req.user._id },
      {
        $set: { events: [{ eventId: mongoose.Types.ObjectId(eventId), role }] },
      },
    ).exec();

    res.json({ success: true });
  }),
);

router.get(
  '/api/events/:id',
  requiresAuth({ error: true }),
  asyncHandler(async (req: ReqWithUser, res: express.Response) => {
    const { id: eventId } = req.params;
    const { showResolved } = req.query;

    const userEvent = req.user.events.find(
      event => String(event.eventId) === eventId,
    );

    if (!userEvent) {
      throw new NotFoundError('Event not found');
    }

    const event = (await Event.findById(eventId)
      .populate('helpRequests.creator', 'name email _id')
      .exec()) as RenderedEvent | null;

    if (!event) {
      throw new Error('Event not found');
    }

    let fields = ['_id', 'name', 'city', 'state', 'endsAt'];

    if (String(event.owner) === String(req.user._id)) {
      fields = fields.concat(['attendeePassword', 'mentorPassword']);
    }

    let helpRequests = (event.toObject() as RenderedEvent).helpRequests.map(
      helpReq => ({
        ...helpReq,
        creator: {
          _id: helpReq.creator._id,
          name: helpReq.creator.name,
          email: helpReq.allowEmail ? helpReq.creator.email : undefined,
        },
      }),
    );

    helpRequests.sort((a, b) =>
      a.createdAt.getTime() - b.createdAt.getTime() < 0 ? 1 : -1,
    );

    if (userEvent.role === 'attendee') {
      helpRequests = helpRequests.filter(
        helpReq => String(helpReq.creator._id) === String(req.user._id),
      );
    } else {
      if (!showResolved) {
        helpRequests = helpRequests.filter(helpReq => !helpReq.resolved);
      }

      helpRequests = helpRequests.slice(0, 25);
    }

    res.json({
      role: userEvent.role,
      ...pick(event, fields),
      helpRequests,
    });
  }),
);

router.post(
  '/api/events/create',
  requiresAuth({ error: true }),
  asyncHandler(async (req: ReqWithUser, res: express.Response) => {
    const { name, city, state, endDate } = req.body;
    const db: typeof mongoose = req.app.locals.db;

    if (!name || !endDate) {
      throw new BadRequestError('Missing fields');
    }

    if (req.user.events.length) {
      throw new BadRequestError('You already belong to an event');
    }

    const endsAt = validator.toDate(endDate);

    if (!endsAt) {
      throw new BadRequestError('Date is not a date');
    }

    const now = new Date();

    if (validator.isBefore(endDate, now.toString())) {
      throw new BadRequestError('Date is in the past');
    }

    const [attendeePassword, mentorPassword] = await genEventCodes(2);

    const session = await db.startSession();
    session.startTransaction();

    const events = await Event.create(
      //array is required for creating within sessions
      [
        {
          name,
          city,
          state,
          attendeePassword,
          mentorPassword,
          endsAt,
          owner: req.user._id,
        },
      ],
      { session },
    );

    const event = events[0];

    await User.updateOne(
      { _id: req.user._id },
      { $set: { events: [{ eventId: event._id, role: 'owner' }] } },
      { session },
    ).exec();

    await session.commitTransaction();

    res.json(
      pick(event, [
        '_id',
        'name',
        'city',
        'state',
        'endsAt',
        'attendeePassword',
        'mentorPassword',
      ]),
    );
  }),
);

router.post(
  '/api/events/update',
  requiresAuth({ error: true }),
  asyncHandler(async (req: ReqWithUser, res: express.Response) => {
    const { eventId, name, city, state, endDate } = req.body;

    if (!name || !endDate) {
      throw new BadRequestError('Missing fields');
    }

    const event = await Event.findById(eventId);

    if (!event || String(event.owner) !== String(req.user._id)) {
      throw new NotFoundError('Event not found');
    }

    const endsAt = validator.toDate(endDate);

    if (!endsAt) {
      throw new BadRequestError('Date is not a date');
    }

    const now = new Date();

    if (validator.isBefore(endDate, now.toString())) {
      throw new BadRequestError('Date is in the past');
    }

    await event
      .update({
        $set: {
          name,
          city,
          state,
          endsAt,
        },
      })
      .exec();

    res.json({ success: true });
  }),
);

export default router;
