import { createStore, Action, applyMiddleware } from 'redux';
import { AppStore, User } from 'client/types';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer from './reducers';

const initStore = (
  { user: authedUser }: { user?: User | null } = { user: null },
) =>
  createStore<AppStore, Action<any>, any, any>(
    reducer,
    {
      user: authedUser,
      event: null,
    },
    composeWithDevTools(applyMiddleware(thunk)),
  );

export default initStore;
