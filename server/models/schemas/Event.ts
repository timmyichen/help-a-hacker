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
  },
  {
    timestamps: true,
  },
);

const Event: Model<IEvent> = model<IEvent>('Event', EventSchema);

export default Event;
