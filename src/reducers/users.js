import {
  UPDATE_USERS_DATA,
  CREATE_USER_DATA,
  UPDATE_USER_DATA,
  DELETE_USER_DATA
} from '../constants/ActionTypes';
import { mergeObjArrays } from '../utils';
import { combineReducers } from 'redux';
export default combineReducers({
  lastUser,
  users,
});
/*export default function todos(state = {}, action) {
  let va = {
    lastUser: lastUser(state.lastUser, action),
    users: users(state.users, action)
  };
  console.log('users', va);
  return {...state,...va};
}*/
function lastUser(state = null, action) {
  switch (action.type) {
    case UPDATE_USERS_DATA:
      return action.lastUser;
    default:
      return state;
  }
}
function users(state = [], action) {
  switch (action.type) {
    case UPDATE_USERS_DATA:
      return mergeObjArrays(state, action.data, 'id');
    case CREATE_USER_DATA:
      return [
        ...state,
        {
          ...action.data
        }
      ];
    case UPDATE_USER_DATA:
      return state.map(user => {
        if (user.sap_id === action.id) {
          return { ...user, ...action.data };
        }
        return user;
      });
    case DELETE_USER_DATA:
      return state.filter(user => {
        if (user.sap_id === action.id) {
          return false;
        }
        return true;
      });
    default:
      return state;
  }
}
