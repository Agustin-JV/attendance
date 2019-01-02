import {
UPDATE_CALENDAR_DATA ,
CREATE_CALENDAR_ENTRY ,
UPDATE_CALENDAR_ENTRY ,
DELETE_CALENDAR_ENTRY
} from '../constants/ActionTypes';

import { actOnObjectElement, objectFilter } from '../utils';
export default function todos(state = {}, action) {
  switch (action.type) {
    case UPDATE_CALENDAR_DATA:
      return {...state,...action.data};
      
    case CREATE_CALENDAR_ENTRY:
      return actOnObjectElement(
        ['shift', action.id, action.month, action.year], 
        state, 
        x => { return { ...action.data }; }
        );
    case UPDATE_CALENDAR_ENTRY:
      return actOnObjectElement(
          ['shift', action.id, action.month, action.year], 
          state, 
          x => { return { ...x, ...action.data };
      });

    case DELETE_CALENDAR_ENTRY:
    return actOnObjectElement(
        ['shift', action.id, action.month, action.year], 
        state, 
        x => { return { ...action.data }; }
        );

    default:
      return state;
  }
}

