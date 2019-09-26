import { Document, Schema } from 'mongoose';

export type OId = Schema.Types.ObjectId;

export interface IUser extends Document {
  email: string;
  name: string;
  password: string;
}

export interface IEvent extends Document {
  name: string;
  city: string;
  state: string;
  attendeePassword: string;
  mentorPassword: string;
  owner: IUser;
}
