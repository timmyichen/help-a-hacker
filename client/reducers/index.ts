import { AppStore } from 'client/types';
import { UserAction } from 'client/actions';

export function user(state: AppStore, action: UserAction): AppStore {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.user,
      };
  }

  return state;
}
