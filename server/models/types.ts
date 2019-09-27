import { Document, Schema } from 'mongoose';

export type OId = Schema.Types.ObjectId;

export interface IUser extends Document {
  _id: OId;
  email: string;
  name: string;
  password: string;
  events: Array<IEvent>;
}

export interface IEvent extends Document {
  _id: OId;
  name: string;
  city: string;
  state: string;
  attendeePassword: string;
  mentorPassword: string;
  owner: IUser;
}
