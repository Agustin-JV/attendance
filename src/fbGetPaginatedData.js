'use strict';
import { db } from './fire_init';
import { bounded } from './idb_querys';
import { addUpdate } from './indexeddb_tools';
import table_structures from './table_structures.json';
import { isEmpty } from './utils';
import { detectIE } from './detectBrowser';
import { ONGOING, COMPLETE, FAIL } from './constants/LoadingStatusTypes';
import { downloadloading } from './actions';
//TODO look on an idb the last time x collection was searched so if its a while ago insted of cache first go for live first

/**
 * @param {String} collection the path to find the collection
 * @param {function} callback should implement a promice that returns with no arguments  like -> return new Promise((resolve) => { resolve();})
 * @param {...args} args they will be passed to the callback
 */
export const getDocument = async (collection, doc, callback, ...args) => {
  let fresh = await isCacheFresh(collection + '-' + doc);
  if (fresh) {
    db.collection(collection)
      .doc(doc)
      .get({ source: 'cache' })
      .then(
        processDocumentQuery(getData, collection, doc, callback, ...args),
        error => {
          console.log(getData, error);
        }
      );
  } else {
    db.collection(collection)
      .doc(doc)
      .get()
      .then(
        processDocumentQuery(getData, collection, doc, callback, ...args),
        error => {
          console.log(getData, error);
        }
      );
  }
};
const processDocumentQuery = (
  caller,
  collection,
  doc,
  callback,
  ...args
) => querySnapshot => {
  let empty = querySnapshot.empty;
  let fromCache = querySnapshot.metadata.fromCache;
  if (!fromCache) {
    let path_pos = '' + collection + '-' + doc;
    addUpdate(
      { path_pos: path_pos, path: collection, retrieve_date: Date.now() },
      path_pos,
      table_structures.attendancefb.object_stores.scheduler,
      'path_pos'
    );
  }

  callback(querySnapshot, ...args).then(() => {
    if (fromCache && empty) {
      db.collection(collection)
        .doc(doc)
        .get()
        .then(
          processQuery(getData, collection, doc, callback, ...args),
          error => {
            console.log('goLive begining', error);
          }
        );
    }
  });
};

const onRetrieveError = (dispatch, tag) => error => {
  dispatch(downloadloading(tag, FAIL));
  console.log(dispatch, error);
};

/**
 * @param {String} collection the path to find the collection
 * @param {number} limit limit the amount of records fetched
 * @param {function} callback should implement a promice that returns with no arguments  like -> return new Promise((resolve) => { resolve();})
 * @param {...args} args they will be passed to the callback
 */
export const getData = ({ collection, tag, limit, callback, ...args }) => {
  //console.log('limit' ,limit,'tag',tag)
  //console.log('getData, fresh', fresh, collection);
  return async dispatch => {
    dispatch(downloadloading(tag, ONGOING));

    /*isCacheFresh('' + collection + limit + '--1').then(fresh => {
      if (fresh) {
        db.collection(collection)
          .limit(limit)
          .get({ source: 'cache' })
          .then(
            processQuery(
              getData,
              dispatch,
              collection,
              tag,
              limit,
              callback,
              null,
              args
            ),
            onRetrieveError(dispatch, tag)
          );
      
      } else {
        db.collection(collection)
          .limit(limit)
          .get()
          .then(
            processQuery(
              getData,
              dispatch,
              collection,
              tag,
              limit,
              callback,
              null,
              args
            ),
            onRetrieveError(dispatch, tag)
          );
      }
      return dispatch(downloadloading(tag, ONGOING));
    });*/
    let fresh = await isCacheFresh('' + collection + limit + '--1');
    console.log('fresh',fresh)
    let out;
    if (fresh)
      out = await db
        .collection(collection)
        .limit(limit)
        .get({ source: 'cache' })
        .then(
          processQuery(
            getData,
            dispatch,
            collection,
            tag,
            limit,
            callback,
            null,
            args
          ),
          onRetrieveError(dispatch, tag)
        );
    else
      out = await db
        .collection(collection)
        .limit(limit)
        .get()
        .then(
          processQuery(
            getData,
            dispatch,
            collection,
            tag,
            limit,
            callback,
            null,
            args
          ),
          onRetrieveError(dispatch, tag)
        );
    console.log(out)
    return dispatch(downloadloading('NEW', COMPLETE));
  };
};

const processQuery = (
  caller,
  dispatch,
  collection,
  tag,
  limit,
  callback,
  lastRow,
  args
) => querySnapshot => {
  console.log(collection, tag);
  let empty = querySnapshot.empty;
  let fromCache = querySnapshot.metadata.fromCache;
  let lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
  let lr = lastRow;
  //console.log('lastRow', lastRow, lastVisible)
  lastRow = lastVisible !== undefined ? lastVisible : lastRow;
  //console.log('lastRow',lastVisible,lastRow)
  lr = lr ? lr.id : '-1';
  if (!fromCache && lr) {
    let path_pos = '' + collection + '-' + limit + '-' + lr;
    addUpdate(
      {
        path_pos: path_pos,
        path: collection,
        after: lr,
        retrieve_date: Date.now()
      },
      path_pos,
      table_structures.attendancefb.object_stores.scheduler,
      'path_pos'
    );
  }
  //console.log('lastRow',lastRow)
  dispatch(downloadloading(tag, FAIL));

  return new Promise(resolve => {
    callback(dispatch, querySnapshot, lastRow ? lastRow.id : null, args).then(
      x => {
        console.log('in den callback', x);
        resolve(x);
        goLive(
          dispatch,
          collection,
          tag,
          limit,
          fromCache,
          empty,
          caller,
          callback,
          lastRow,
          args
        );
      }
    );
  });
};

const goLive = (
  dispatch,
  collection,
  tag,
  limit,
  fromCache,
  empty,
  caller,
  callback,
  lastRow,
  args
) => () => {
  //var source = fromCache ? 'local cache' : 'server';
  //console.log('Data came from ' + source + ' ' + caller);
  if (fromCache && empty) {
    console.log('goLive', fromCache, empty);
    dispatch(downloadloading(tag, ONGOING));
    if (lastRow !== null && lastRow !== undefined && caller === getMoreData) {
      return db
        .collection(collection)
        .startAfter(lastRow)
        .limit(limit)
        .get()
        .then(
          processQuery(
            getMoreData,
            dispatch,
            collection,
            tag,
            limit,
            callback,
            lastRow,
            args
          ),
          onRetrieveError(dispatch, tag)
        );
    } else {
      return db
        .collection(collection)
        .limit(limit)
        .get()
        .then(
          processQuery(
            getData,
            dispatch,
            collection,
            tag,
            limit,
            callback,
            null,
            args
          ),
          onRetrieveError(dispatch, tag)
        );
    }
  }
};
/**
 * @param {String} collection the path to find the collection
 * @param {number} limit limit the amount of records fetched
 * @param {function} callback should implement a promice that returns with no arguments  like -> return new Promise((resolve) => { resolve();})
 * @param {fbDocument} lastRow the las document looked at
 * @param {...args} args they will be passed to the callback
 */
export const getMoreData = ({
  collection,
  tag,
  limit,
  callback,
  lastRow,
  ...args
}) => {
  console.log('limit', limit, 'tag', tag);
  if (lastRow !== null && lastRow !== undefined) {
    return (dispatch, getState) => {
      dispatch(downloadloading(tag, ONGOING));
      isCacheFresh('' + collection + '-' + limit + '-' + lastRow.id).then(
        fresh => {
          if (fresh) {
            db.collection(collection)
              .startAfter(lastRow)
              .limit(limit)
              .get({ source: 'cache' })
              .then(
                processQuery(
                  getMoreData,
                  collection,
                  tag,
                  limit,
                  callback,
                  lastRow,
                  args
                ),
                onRetrieveError(dispatch, tag)
              );
          } else {
            db.collection(collection)
              .startAfter(lastRow)
              .limit(limit)
              .get()
              .then(
                processQuery(
                  getMoreData,
                  collection,
                  tag,
                  limit,
                  callback,
                  lastRow,
                  args
                ),
                onRetrieveError(dispatch, tag)
              );
          }
        }
      );
    };
  } else {
    return getData(collection, callback, ...args);
  }
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
  /*return new Promise((resolve, reject) => {
    //if both dates are within the same date, ignoring time
    resolve(now.valueOf() === lastRetrieve);
  });*/
  return now.valueOf() === lastRetrieve;
};
