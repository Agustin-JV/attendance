'use strict';
import { db } from './fire_init';
import { bounded } from './idb_querys';
import { addUpdate } from './indexeddb_tools';
import table_structures from './table_structures.json';
import { isEmpty } from './utils';
import { detectIE } from './detectBrowser';
import { ONGOING, COMPLETE, FAIL } from './constants/LoadingStatusTypes';
import { downloadloading } from './actions';

/**
 * @param {String} collection the path to find the collection
 * @param {String} tag tag that the proces uses
 * @param {String} doc name of the document to retrive
 * @param {function} callback should implement a promice that returns with no arguments  like -> return new Promise((resolve) => { resolve();})
 * @param {...args} args they will be passed to the callback
 */
export const getDocument = ({
  collection,
  tag,
  doc,
  callback,
  live,
  ...args
}) => async dispatch => {
  dispatch(downloadloading(tag, ONGOING));
  //look if we got local data and its fresh less than a day old
  let fresh = live ? false : await isCacheFresh(collection + '-' + doc);
  //start the call
  let dbCall = db.collection(collection).doc(doc);
  //depending if its fresh use eather the cashe or go for the server
  let dbGet = fresh ? dbCall.get({ source: 'cache' }) : dbCall.get();
  //get the responce
  dbGet.then(
    processDocumentQuery(
      getData,
      dispatch,
      collection,
      tag,
      doc,
      callback,
      args
    ),
    onRetrieveError(dispatch, tag)
  );
  console.warn('cache?:', fresh);
};
const processDocumentQuery = (
  caller,
  dispatch,
  collection,
  tag,
  doc,
  callback,
  ...args
) => querySnapshot => {
  let empty = querySnapshot.empty;
  let fromCache = querySnapshot.metadata.fromCache;
  if (!fromCache) addCacheRef(collection + '-' + doc, collection);
  return new Promise(resolve => {
    callback(dispatch, querySnapshot, ...args).then(x => {
      if (fromCache && empty) {
        getDocument({
          collection,
          tag,
          doc,
          callback,
          live: true,
          ...args
        });
      }
      resolve(x);
    });
  });
};

const onRetrieveError = (dispatch, tag) => error => {
  dispatch(downloadloading(tag, FAIL));
  console.error('onRetrieveError', dispatch, error, tag);
};

/**
 * @param {String} collection the path to find the collection
 * @param {String} tag tag that the proces uses
 * @param {number} limit limit the amount of records fetched
 * @param {function} callback should implement a promice that returns with no arguments  like -> return new Promise((resolve) => { resolve();})
 * @param {...args} args they will be passed to the callback
 */
export const getData = ({
  collection,
  tag,
  limit,
  callback,
  live,
  lastRow,
  ...args
}) => {
  return async dispatch => {
    //Anounce we are loading
    dispatch(downloadloading(tag, ONGOING));
    //look if we got local data and its fresh less than a day old
    let fresh = live
      ? false
      : await isCacheFresh(
          '' + collection + '-' + limit + '-' + (lastRow ? lastRow.id : '-1')
        );
    //start the call
    let dbCall = db.collection(collection);
    //if lastrow start after it.
    if (lastRow) dbCall = dbCall.startAfter(lastRow);
    //add limit
    dbCall = dbCall.limit(limit);
    //depending if its fresh use eather the cashe or go for the server
    let dbGet = fresh ? dbCall.get({ source: 'cache' }) : dbCall.get();
    dbGet.then(
      processQuery(dispatch, collection, tag, limit, callback, lastRow, args),
      onRetrieveError(dispatch, tag)
    );
    console.warn('cache?:', fresh);
  };
};

const processQuery = (
  dispatch,
  collection,
  tag,
  limit,
  callback,
  lastRow,
  args
) => querySnapshot => {
  let empty = querySnapshot.empty;
  let fromCache = querySnapshot.metadata.fromCache;
  let lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
  let lr = lastRow;
  lastRow = lastVisible !== undefined ? lastVisible : lastRow;
  lr = lr ? lr.id : '-1';
  if (!fromCache && lr)
    addCacheRef(collection + '-' + limit + '-' + lr, collection, lr);

  return new Promise(resolve => {
    callback(dispatch, querySnapshot, lastRow ? lastRow.id : null, args).then(
      x => {
        resolve(x);
        if (empty && fromCache)
          getData({
            collection,
            tag,
            limit,
            callback,
            live: true,
            lastRow,
            ...args
          });
      }
    );
  });
};

const addCacheRef = (path_pos, collection, after) => {
  addUpdate(
    { path_pos: path_pos, path: collection, after, retrieve_date: Date.now() },
    path_pos,
    table_structures.attendancefb.object_stores.scheduler,
    'path_pos'
  );
};

const isCacheFresh = async key => {
  if (detectIE() !== false) {
    return false;
  }
  let record = await bounded.call(
    { z: key },
    table_structures.attendancefb.object_stores.scheduler,
    'path_pos',
    'all'
  );
  let lastRetrieve = null;
  let now = new Date();
  now.setHours(0, 0, 0, 0);

  if (!isEmpty(record) && record.length === 1) {
    lastRetrieve = new Date(record[0].retrieve_date);
    lastRetrieve = lastRetrieve.setHours(0, 0, 0, 0);
  }
  console.log('isCacheFresh', now.valueOf(), lastRetrieve, record, key);
  return now.valueOf() === lastRetrieve;
};
