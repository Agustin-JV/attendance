'use strict';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
//import api from '../middleware/api'
import rootReducer from '../reducers';
import DevTools from '../containers/DevTools';
import promiseMiddleware from 'redux-promise';
const configureStore = preloadedState => {
  const store = createStore(
    rootReducer,
    //preloadedState,
    applyMiddleware(thunk, createLogger())
  );

  return store;
};

export default configureStore;
