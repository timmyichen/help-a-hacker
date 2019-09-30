import { Document, Schema } from 'mongoose';

export type OId = Schema.Types.ObjectId;

export type Role = 'attendee' | 'mentor' | 'owner';
export interface IUser extends Document {
  _id: OId;
  email: string;
  name: string;
  password: string;
  events: Array<{
    eventId: OId;
    role: Role;
  }>;
}

interface BaseHelpRequest extends Document {
  _id: OId;
  title: string;
  description: string;
  location: string;
  allowEmail: boolean;
  createdAt: Date;
  resolved: boolean;
}

export interface HelpRequest extends BaseHelpRequest {
  creator: OId;
}

export interface RenderedHelpRequest extends BaseHelpRequest {
  creator: {
    _id: OId;
    name: string;
    email?: string;
  };
}

interface BaseEvent extends Document {
  _id: OId;
  name: string;
  city: string;
  state: string;
  attendeePassword: string;
  mentorPassword: string;
  owner: OId;
  endsAt: Date;
}

export interface IEvent extends BaseEvent {
  helpRequests: Array<HelpRequest>;
}

export interface RenderedEvent extends BaseEvent {
  helpRequests: Array<RenderedHelpRequest>;
}
