import { Schema, Model, model } from 'mongoose';
import { IUser } from '../types';

const UserSchema: Schema = new Schema(
  {
    email: String,
    name: String,
    password: String,
    events: [
      {
        eventId: {
          type: Schema.Types.ObjectId,
          ref: 'Event',
        },
        role: {
          type: String,
          enum: ['attendee', 'mentor', 'owner'],
        },
      },
    ],
  },
  { timestamps: true },
);

const User: Model<IUser> = model<IUser>('User', UserSchema);

export default User;
