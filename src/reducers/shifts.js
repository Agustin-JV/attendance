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
  //console.log('shifts',va)
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
    console.warning('Error happening becasue the mesage contains the firevase object and it shoud not be')
      action.data.docs.forEach(user => {
        state = actOnObjectElement(
          ['shifts', user.id, action.month, action.year],
          state,
          x => user.data().m
        );
      });
      return state;
    //return action.data; //actOnObjectElement( action.path, state, action.func(action.data) );
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
    /*return {
            ...state,[action.year]:{
                ...state[action.year],[action.month]:{
                    ...state[action.year][action.month],[action.id]:{
                        shifst:{
                            ...state[action.year][action.month][action.id].shifts, 
                            ...action.data
                        }
                    }
                }
            }
        }*/
    case REPLACE_SHIFT_DATA:
      return actOnObjectElement(
        ['shift', action.id, action.month, action.year],
        state,
        x => {
          return { ...action.data };
        }
      );
    /*return {
        ...state,
        [action.year]: {
          ...state[action.year],
          [action.month]: {
            ...state[action.year][action.month],
            [action.id]: {
              shifst: { ...action.data }
            }
          }
        }
      };*/
    case DELETE_SHIFT_DATA:
      return actOnObjectElement(
        ['shift', action.id, action.month, action.year],
        state,
        x => {
          return objectFilter(x, (k, v) => k !== action.target);
        }
      );
    /* return {
        ...state,
        [action.year]: {
          ...state[action.year],
          [action.month]: {
            ...state[action.year][action.month],
            [action.id]: {
              shifst: {
                ...objectFilter(
                  state[action.year][action.month],
                  [action.id].shifts,
                  (k, v) => k !== action.target
                )
              }
            }
          }
        }
      };*/

    default:
      return state;
  }
}
