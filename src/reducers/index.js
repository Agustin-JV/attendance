import { combineReducers } from 'redux';

import settings from './settings';
import shifts from './shifts';
import users from './users';
import calendar from './calendar';
import loading from './loading';
const rootReducer = combineReducers({
  loading,
  settings,
  calendar,
  shifts,
  users
});

export default rootReducer;
