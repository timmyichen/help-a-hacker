import { Schema, Model, model } from 'mongoose';
import { IEvent } from '../types';

const EventSchema: Schema = new Schema(
  {
    name: String,
    city: String,
    state: String,
    attendeePassword: String,
    mentorPassword: String,
    endsAt: Date,
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    helpRequests: [
      {
        creator: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        title: String,
        description: String,
        location: String,
        allowEmail: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: new Date(),
        },
        resolved: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Event: Model<IEvent> = model<IEvent>('Event', EventSchema);

export default Event;
