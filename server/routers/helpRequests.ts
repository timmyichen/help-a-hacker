import * as express from 'express';
import * as mongoose from 'mongoose';
import * as asyncHandler from 'express-async-handler';
import { requiresAuth } from 'server/middleware/auth';
import { ReqWithUser } from './auth';
import { Event } from 'server/models';
import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} from 'express-response-errors';

const router = express.Router();

router.post(
  '/api/help-requests/create',
  requiresAuth({ error: true }),
  asyncHandler(async (req: ReqWithUser, res: express.Response) => {
    const { eventId, title, description, location, allowEmail } = req.body;

    if (
      !req.user.events.length ||
      eventId !== String(req.user.events[0].eventId)
    ) {
      throw new NotFoundError('Event not found');
    }

    if (!title.trim() || !description.trim() || !location.trim()) {
      throw new BadRequestError('Missing fields');
    }

    const event = await Event.findById(eventId);

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const helpRequest = {
      _id: mongoose.Types.ObjectId(),
      creator: req.user._id,
      title,
      description,
      location,
      allowEmail,
      createdAt: new Date(),
      resolved: false,
    };

    await event
      .update({
        $push: {
          helpRequests: {
            $each: [helpRequest],
            $position: 0,
          },
        },
      })
      .exec();

    res.json({
      helpRequest: {
        ...helpRequest,
        creator: {
          name: req.user.name,
          email: allowEmail ? req.user.email : undefined,
        },
      },
    });
  }),
);

router.post(
  '/api/help-requests/update',
  requiresAuth({ error: true }),
  asyncHandler(async (req: ReqWithUser, res: express.Response) => {
    const {
      eventId,
      helpRequestId,
      title,
      description,
      location,
      allowEmail,
    } = req.body;

    if (
      !req.user.events.length ||
      eventId !== String(req.user.events[0].eventId)
    ) {
      throw new NotFoundError('Event not found');
    }

    if (!title.trim() || !description.trim() || !location.trim()) {
      throw new BadRequestError('Missing fields');
    }

    const event = await Event.findById(eventId);

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        'helpRequests._id': helpRequestId,
      },
      {
        $set: {
          'helpRequests.$.title': title,
          'helpRequests.$.description': description,
          'helpRequests.$.location': location,
          'helpRequests.$.allowEmail': allowEmail,
        },
      },
      {
        new: true,
      },
    ).exec();

    if (!updatedEvent) {
      throw new NotFoundError('Event not found (but this shouldnt happen)');
    }

    const helpRequest = updatedEvent.helpRequests.find(
      helpReq => String(helpReq._id) === helpRequestId,
    );

    res.json({
      helpRequest: {
        ...(helpRequest ? helpRequest.toObject() : {}),
        creator: {
          name: req.user.name,
          email: allowEmail ? req.user.email : undefined,
        },
      },
    });
  }),
);

router.post(
  '/api/help-requests/set-resolved',
  requiresAuth({ error: true }),
  asyncHandler(async (req: ReqWithUser, res: express.Response) => {
    const { eventId, helpRequestId, newStatus } = req.body;

    if (
      !req.user.events.length ||
      eventId !== String(req.user.events[0].eventId)
    ) {
      throw new NotFoundError('Event not found');
    }

    const event = await Event.findById(eventId);

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const helpRequest = event.helpRequests.find(
      helpReq => String(helpReq._id) === helpRequestId,
    );

    if (
      !helpRequest ||
      (req.user.events[0].role === 'attendee' &&
        String(req.user._id) !== String(helpRequest.creator))
    ) {
      throw new UnauthorizedError('You dont have permission to do that');
    }

    await Event.findOneAndUpdate(
      {
        _id: eventId,
        'helpRequests._id': helpRequestId,
      },
      {
        $set: {
          'helpRequests.$.resolved': newStatus,
        },
      },
    ).exec();

    res.json({ success: true });
  }),
);

export default router;
