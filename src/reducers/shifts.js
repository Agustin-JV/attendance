import {
  UPDATE_SHIFTS_DATA,
  CREATE_SHIFT_DATA,
  UPDATE_SHIFT_DATA,
  DELETE_SHIFT_DATA,
  REPLACE_SHIFT_DATA
} from '../constants/ActionTypes';

import { actOnObjectElement, objectFilter } from '../utils';
export default function todos(state = {}, action) {
  let va = {
    lastShift: lastShift(state.lastShift, action),
    shifts: shifts(state.shifts, action)
  };
  return va;
}
function lastShift(state = null, action) {
  switch (action.type) {
    case UPDATE_SHIFTS_DATA:
      return action.lastShift;
    default:
      return state;
  }
}
function shifts(state = {}, action) {
  switch (action.type) {
    case UPDATE_SHIFTS_DATA:
      action.data.forEach(user => {
        state = actOnObjectElement(
          ['shifts', user.id, action.month, action.year],
          state,
          x => user.data
        );
      });
      return state;

    case CREATE_SHIFT_DATA:
      return actOnObjectElement(
        ['shift', action.id, action.month, action.year],
        state,
        x => {
          return { ...action.data };
        }
      );

    case UPDATE_SHIFT_DATA:
      return actOnObjectElement(
        ['shift', action.id, action.month, action.year],
        state,
        x => {
          return { ...x, ...action.data };
        }
      );

    case REPLACE_SHIFT_DATA:
      return actOnObjectElement(
        ['shift', action.id, action.month, action.year],
        state,
        x => {
          return { ...action.data };
        }
      );

    case DELETE_SHIFT_DATA:
      return actOnObjectElement(
        ['shift', action.id, action.month, action.year],
        state,
        x => {
          return objectFilter(x, (k, v) => k !== action.target);
        }
      );

    default:
      return state;
  }
}
