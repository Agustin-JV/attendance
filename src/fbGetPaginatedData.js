import { db } from './fire_init';
import { bounded } from './idb_querys';
import { addUpdate } from './indexeddb_tools';
import table_structures from './table_structures.json';
import { isEmpty } from './utils';
import { detectIE } from './detectBrowser';
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
      .then(processDocumentQuery(getData, collection, doc, callback, ...args), error => {
        console.log(getData, error);
      });
  } else {
    db.collection(collection)
      .doc(doc)
      .get()
      .then(processDocumentQuery(getData, collection, doc, callback, ...args), error => {
        console.log(getData, error);
      });
  }
};
const processDocumentQuery = (caller, collection, doc, callback, ...args) => querySnapshot => {
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
        .then(processQuery(getData, collection, doc, callback, ...args), error => {
          console.log('goLive begining', error);
        });
    }
  });
};

/**
 * @param {String} collection the path to find the collection
 * @param {number} limit limit the amount of records fetched
 * @param {function} callback should implement a promice that returns with no arguments  like -> return new Promise((resolve) => { resolve();})
 * @param {...args} args they will be passed to the callback
 */
export const getData = async (collection, limit, callback, ...args) => {
  let fresh = await isCacheFresh('' + collection + limit + '--1');
  //console.log('getData, fresh', fresh, collection);
  if (fresh) {
    db.collection(collection)
      .limit(limit)
      .get({ source: 'cache' })
      .then(processQuery(getData, collection, limit, callback, null, ...args), error => {
        console.log(getData, error);
      });
  } else {
    db.collection(collection)
      .limit(limit)
      .get()
      .then(processQuery(getData, collection, limit, callback, null, ...args), error => {
        console.log(getData, error);
      });
  }
};

const processQuery = (caller, collection, limit, callback, lastRow, ...args) => querySnapshot => {
  //console.log(caller, collection, querySnapshot);
  let empty = querySnapshot.empty;
  let fromCache = querySnapshot.metadata.fromCache;
  let lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
  let lr = lastRow;
  lastRow = lastVisible !== undefined ? lastVisible : lastRow;
  lr = lr ? lr.id : '-1';
  if (!fromCache && lr) {
    let path_pos = '' + collection + '-' + limit + '-' + lr;
    addUpdate(
      { path_pos: path_pos, path: collection, after: lr, retrieve_date: Date.now() },
      path_pos,
      table_structures.attendancefb.object_stores.scheduler,
      'path_pos'
    );
  }

  callback(querySnapshot, ...args).then(
    goLive(collection, limit, fromCache, empty, caller, callback, lastRow, ...args)
  );
};

const goLive = (collection, limit, fromCache, empty, caller, callback, lastRow, ...args) => () => {
  //var source = fromCache ? 'local cache' : 'server';
  //console.log('Data came from ' + source + ' ' + caller);
  if (fromCache && empty) {
    if (lastRow !== null && lastRow !== undefined && caller === getMoreData) {
      db.collection(collection)
        .startAfter(lastRow)
        .limit(limit)
        .get()
        .then(processQuery(getMoreData, collection, limit, callback, lastRow, ...args), error => {
          console.log('goLive after', error);
        });
    } else {
      db.collection(collection)
        .limit(limit)
        .get()
        .then(processQuery(getData, collection, limit, callback, null, ...args), error => {
          console.log('goLive begining', error);
        });
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
export const getMoreData = async (collection, limit, callback, lastRow, ...args) => {
  if (lastRow !== null && lastRow !== undefined) {
    let fresh = await isCacheFresh('' + collection + '-' + limit + '-' + lastRow.id);
    if (fresh) {
      db.collection(collection)
        .startAfter(lastRow)
        .limit(limit)
        .get({ source: 'cache' })
        .then(processQuery(getMoreData, collection, limit, callback, lastRow, ...args));
    } else {
      db.collection(collection)
        .startAfter(lastRow)
        .limit(limit)
        .get()
        .then(processQuery(getMoreData, collection, limit, callback, lastRow, ...args));
    }
  } else {
    getData(collection, callback, ...args);
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

  //if both dates are within the same date, ignoring time
  return now.valueOf() === lastRetrieve;
};
