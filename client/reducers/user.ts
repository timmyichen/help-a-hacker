import { User } from 'client/types';
import { UserAction } from 'client/actions/user';

type State = User | null;

export function user(state: State = null, action: UserAction): State {
  switch (action.type) {
    case 'SET_USER':
      return action.user;
  }

  return state;
}
