import { UPLOAD, DOWNLOAD, SAVE, PROCESS } from '../constants/ActionTypes';
import { REMOVE } from '../constants/LoadingStatusTypes';

import { combineReducers } from 'redux';
import {objectFilter} from '../utils'
/*export default combineReducers({
download: loadingType(DOWNLOAD),
save: loadingType(SAVE),
process: loadingType(PROCESS),
 upload: loadingType(UPLOAD)
});
*/
export default function loading(state = {}, action) {
  let va = {
    download: loadingType(DOWNLOAD)(state.download, action),
    save: loadingType(SAVE)(state.save, action),
    process: loadingType(PROCESS)(state.process, action),
    upload: loadingType(UPLOAD)(state.upload, action)
  };

  //console.log('loading',va)
  return va;
}

/*export default function loadingType(state = {}, action) {
  switch (action.type) {
    case DOWNLOAD:
      if (action.status === REMOVE)
        return state.filter(x => x[action.key] === undefined);
      let newState = Object.assign({}, state, { [action.key]: action.status });
      console.log('newState', newState);
      return newState;
    default:
      return state;
  }
}*/

const loadingType = type => (state = [], action) => {
  switch (action.type) {
    case type:
      if (action.status === REMOVE){
        return objectFilter(state,((key,value) => key !== action.key));
        }
      return Object.assign({}, state, { [action.key]: action.status });
    default:
      return state;
  }
};
