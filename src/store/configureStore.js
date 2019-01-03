import { createStore, applyMiddleware, compose } from 'redux';
//import thunk from 'redux-thunk'

//import api from '../middleware/api'
import rootReducer from '../reducers';
//import DevTools from '../containers/DevTools'

const configureStore = preloadedState => {
  const store = createStore(rootReducer, preloadedState);

  return store;
};

export default configureStore;
