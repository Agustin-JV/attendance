import { UPLOAD, DOWNLOAD, SAVE, PROCESS } from '../constants/ActionTypes';
import { REMOVE } from '../constants/LoadingStatusTypes';

export default function loading(state = {}, action) {
  return {
    download: loadingType(DOWNLOAD)(state.download, action),
    save: loadingType(SAVE)(state.save, action),
    process: loadingType(PROCESS)(state.process, action),
    upload: loadingType(UPLOAD)(state.upload, action)
  };
}

const loadingType = type => (state = [], action) => {
  switch (action.type) {
    case type:
      if (action.status === REMOVE)
        return state.filter(x => x[action.key] === undefined);
      return Object.assign({}, state, { [action.key]: action.status });
    default:
      return state;
  }
};
