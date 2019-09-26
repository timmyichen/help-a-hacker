import { createStore, Action } from 'redux';
import { AppStore } from 'client/types';
import { user } from 'client/reducers';
import { composeWithDevTools } from 'redux-devtools-extension';

const initStore = () =>
  createStore<AppStore, Action<any>, any, any>(
    user,
    {
      user: null,
    },
    composeWithDevTools(),
  );

export default initStore;
