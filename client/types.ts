import * as React from 'react';

export interface User {
  name?: string;
  events: Array<{ id: string; role: Role }>;
  email?: string;
  createdAt: Date;
}

export type Role = 'attendee' | 'mentor' | 'owner';

export interface HelpRequest {
  _id: string;
  creator: {
    name: string;
    email?: string;
  };
  title: string;
  description: string;
  location: string;
  allowEmail: boolean;
  createdAt: Date;
  resolved: boolean;
}

export interface Event {
  _id: string;
  name: string;
  city?: string;
  state?: string;
  helpRequests: Array<HelpRequest>;
  role: Role;
  attendeePassword?: string;
  mentorPassword?: string;
}

export interface AppStore {
  user: User | null;
  event: Event | null;
}

export type InputEvent = React.ChangeEvent<HTMLInputElement>;
