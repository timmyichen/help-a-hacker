import { createStore, Action } from 'redux';
import { AppStore, User } from 'client/types';
import { user } from 'client/reducers';
import { composeWithDevTools } from 'redux-devtools-extension';

const initStore = ({ user: authedUser }: { user: User }) =>
  createStore<AppStore, Action<any>, any, any>(
    user,
    {
      user: authedUser,
    },
    composeWithDevTools(),
  );

export default initStore;