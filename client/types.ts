import * as React from 'react';

export interface User {
  name: string;
}

export interface AppStore {
  user: User | null;
}

export interface Event {
  _id: string;
  name: string;
  city: string;
  state: string;
  attendeePassword?: string;
  mentorPassword?: string;
}

export type Role = 'attendee' | 'mentor';

export type InputEvent = React.ChangeEvent<HTMLInputElement>;
