import { createStore, Action, applyMiddleware } from 'redux';
import { AppStore, User } from 'client/types';
import thunk from 'redux-thunk';
import { user } from 'client/reducers';
import { composeWithDevTools } from 'redux-devtools-extension';

const initStore = (
  { user: authedUser }: { user?: User | null } = { user: null },
) =>
  createStore<AppStore, Action<any>, any, any>(
    user,
    {
      user: authedUser,
    },
    composeWithDevTools(applyMiddleware(thunk)),
  );

export default initStore;
