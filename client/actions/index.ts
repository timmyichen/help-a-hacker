import { User } from 'client/types';

export interface ISetUser {
  type: 'SET_USER';
  user: User | null;
}

export type UserAction = ISetUser;

export function setUser(user: User): ISetUser {
  return {
    type: 'SET_USER',
    user,
  };
}
