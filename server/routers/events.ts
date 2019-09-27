import * as express from 'express';
import * as mongoose from 'mongoose';
import * as asyncHandler from 'express-async-handler';
import { requiresAuth } from 'server/middleware/auth';
import { Event, User } from 'server/models';
import { ReqWithUser } from './auth';
import { pick } from 'lodash';
import { genEventCodes } from 'server/lib/codeGeneration';
import * as validator from 'validator';

const router = express.Router();

router.get(
  '/api/events/find',
  requiresAuth({ error: true }),
  asyncHandler(async (req: ReqWithUser, res: express.Response) => {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send({ message: 'missing code' });
    }

    const event = await Event.findOne({
      $or: [{ attendeePassword: code }, { mentorPassword: code }],
    });

    if (!event) {
      return res.status(404).send({ message: 'Event not found' });
    }

    res.json(pick(event, ['_id', 'name', 'city', 'state', 'endsAt']));
  }),
);

router.post(
  '/api/events/create',
  requiresAuth({ error: true }),
  asyncHandler(async (req: ReqWithUser, res: express.Response) => {
    const { name, city, state, endDate } = req.body;
    const db: typeof mongoose = req.app.locals.db;

    if (!name || !endDate) {
      return res.status(400).send({ message: 'missing fields' });
    }

    if (req.user.events.length) {
      return res
        .status(400)
        .send({ message: 'You already have an event created ' });
    }

    const endsAt = validator.toDate(endDate);

    if (!endsAt) {
      return res.status(400).send({ message: 'Date is not a date' });
    }

    const now = new Date();

    if (validator.isBefore(endDate, now.toString())) {
      return res.status(400).send({ message: 'Date is in the past' });
    }

    const [attendeePassword, mentorPassword] = await genEventCodes(2);

    console.log;

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

    console.log(event._id);
    console.log(typeof event._id);

    const x = await User.updateOne(
      { _id: req.user._id },
      { $set: { events: [String(event._id)] } },
      { session },
    ).exec();

    console.log(x);

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

export default router;
