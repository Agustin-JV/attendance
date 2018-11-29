import { db } from './fire_init';
import { bounded } from './idb_querys';
import { addUpdate } from './indexeddb_tools';
import table_structures from './table_structures.json';
import { isEmpty } from './utils';
//TODO look on an idb the last time x collection was searched so if its a while ago insted of cache first go for live first

/**
 * @param {String} collection the path to find the collection
 * @param {function} callback should implement a promice that returns with no arguments  like -> return new Promise((resolve) => { resolve();})
 * @param {...args} args they will be passed to the callback
 */
export const getData = async (collection, callback, ...args) => {
  let fresh = await isCacheFresh(collection, '-1');
  if (fresh) {
    db.collection(collection)
      .limit(50)
      .get({ source: 'cache' })
      .then(processQuery(getData, collection, callback, null, ...args), error => {
        console.log(getData, error);
      });
  } else {
    db.collection(collection)
      .limit(50)
      .get()
      .then(processQuery(getData, collection, callback, null, ...args), error => {
        console.log(getData, error);
      });
  }
};

const processQuery = (caller, collection, callback, lastRow, ...args) => querySnapshot => {
  let empty = querySnapshot.empty;
  let fromCache = querySnapshot.metadata.fromCache;
  let lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
  let lr = lastRow;
  lastRow = lastVisible !== undefined ? lastVisible : lastRow;
  lr = lr ? lr.id : '-1';
  if (!fromCache && lr) {
    addUpdate(
      { path: collection, after: lr, retrieve_date: Date.now() },
      [collection, lr],
      table_structures.attendancefb.object_stores.scheduler,
      'path_pos'
    );
  }

  callback(querySnapshot, ...args).then(
    goLive(collection, fromCache, empty, caller, callback, lastRow, ...args)
  );
};

const goLive = (collection, fromCache, empty, caller, callback, lastRow, ...args) => () => {
  //var source = fromCache ? 'local cache' : 'server';
  //console.log('Data came from ' + source + ' ' + caller);
  if (fromCache && empty) {
    if (lastRow !== null && lastRow !== undefined && caller === getMoreData) {
      db.collection(collection)
        .startAfter(lastRow)
        .limit(50)
        .get()
        .then(processQuery(getMoreData, collection, callback, lastRow, ...args), error => {
          console.log('goLive after', error);
        });
    } else {
      db.collection(collection)
        .limit(50)
        .get()
        .then(processQuery(getData, collection, callback, ...args), error => {
          console.log('goLive begining', error);
        });
    }
  }
};
/**
 * @param {String} collection the path to find the collection
 * @param {function} callback should implement a promice that returns with no arguments  like -> return new Promise((resolve) => { resolve();})
 * @param {fbDocument} lastRow the las document looked at
 * @param {...args} args they will be passed to the callback
 */
export const getMoreData = async (collection, callback, lastRow, ...args) => {
  if (lastRow !== null && lastRow !== undefined) {
    let fresh = await isCacheFresh(collection, lastRow.id);
    console.log('fresh', fresh);
    if (fresh) {
      db.collection(collection)
        .startAfter(lastRow)
        .limit(50)
        .get({ source: 'cache' })
        .then(processQuery(getMoreData, collection, callback, lastRow, ...args));
    } else {
      db.collection(collection)
        .startAfter(lastRow)
        .limit(50)
        .get()
        .then(processQuery(getMoreData, collection, callback, lastRow, ...args));
    }
  } else {
    getData(collection, callback, ...args);
  }
};

const isCacheFresh = async (collection, lastRow) => {
  let record = await bounded.call(
    { z: [collection, lastRow] },
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
