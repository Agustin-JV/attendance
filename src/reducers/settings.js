import {
  UPDATE_APP_SETTINGS,
} from '../constants/ActionTypes';
export default function todos(state = {}, action) {
  switch (action.type) {
    case UPDATE_APP_SETTINGS:
      return {...state,...action.data};
    default:
      return state;
  }
}
