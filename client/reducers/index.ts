import { combineReducers } from 'redux';
import { user as userReducer } from './user';
import { events as eventsReducer } from './events';

export default combineReducers({
  user: userReducer,
  event: eventsReducer,
});
