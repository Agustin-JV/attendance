import {
UPDATE_CALENDAR_DATA ,
CREATE_CALENDAR_ENTRY ,
UPDATE_CALENDAR_ENTRY ,
DELETE_CALENDAR_ENTRY
} from '../constants/ActionTypes';

import { actOnObjectElement } from '../utils';
export default function todos(state = {}, action) {
  switch (action.type) {
    case UPDATE_CALENDAR_DATA:
      return {...state,...action.data};
      
    case CREATE_CALENDAR_ENTRY:
      return actOnObjectElement(
        [action.year], 
        state, 
        x => { return [...x, action.data ]; }
        );
    case UPDATE_CALENDAR_ENTRY:
      return actOnObjectElement(
          [action.year], 
          state, 
          x => { return x.map(e=>{
            if(e.date.getTime() === action.data.date.getTime()){
              return action.data;
            }
            return e;
          })
      });

    case DELETE_CALENDAR_ENTRY:
    return actOnObjectElement(
        [action.year], 
        state, 
        x =>  x.filter(e=>e.date.getTime() !== action.data.date.getTime()) 
        );

    default:
      return state;
  }
}

