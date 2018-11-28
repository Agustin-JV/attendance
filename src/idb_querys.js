import { basicTransaction } from './indexeddb_tools';
/**
 * Makes a database request with bounds only call with call
 * call example: bounded.call({x:'a', y:'z',includeY:false},'someIndex');
 * x,y,z can be an array -> example 2: {z:[year, month, x + 1, userResponce]}
 * All keys from someIndex = x && < y
 * At least one of the following params is reqiered
 * @thisParam {string} x <= lowerBound
 * @thisParam {string} y <= upperBound
 * @thisParam {string} z <= only ?=z; do not combine with x & y
 * Optional
 * @thisParam {Boolean} includeX <= default(true = ?=x): false = ?>x
 * @thisParam {Boolean} includeY <= default(true = ?=y): false = ?<y
 * Required
 * @param {string} table from tables structures {project}.object_stores.{table}
 * @param {string} mode cursor|all|count
 * @return {Array} result of the request
 **/
export function bounded(table, indexName, mode) {
  this.x = this.x || null;
  this.y = this.y || null;
  this.z = this.z || null;
  this.includeX = this.includeX || true;
  this.includeY = this.includeY || true;
  let range = null;
  if (this.x !== null && this.y === null) {
    range = IDBKeyRange.lowerBound(this.x, !this.includeX);
  } else if (this.x === null && this.y !== null) {
    range = IDBKeyRange.upperBound(this.y, !this.includeY);
  } else if (this.x !== null && this.y !== null) {
    range = IDBKeyRange.bound(this.x, this.y, !this.includeX, !this.includeY);
  } else if (this.z !== null) {
    range = IDBKeyRange.only(this.z);
    //if this fails probalby we are getting a null or undefined in one of the keys
    //or a complex object
  }
  return new Promise(result => {
    result(
      basicQuery.call(
        {
          range: range
        },
        table,
        indexName,
        mode
      )
    );
  });
}
/**
 * Makes a database request
 * if bounds needed use bounded ^
 * call example:
 * basicQuery.call({range:'someIDBKeyRange', tableName:'someTableName'},'someIndex');
 * Oprional
 * @thisParam {IDBKeyRange or string} range
 * Required
 * @param {string} tableName
 * @param {string} index in witch to make the request
 * @return {Array} result of the request
 **/
export async function basicQuery(table, indexName, mode) {
  let range = this ? this.range || null : null;
  let index = (await basicTransaction(table, 'readonly')).index(indexName);
  if (index) {
    if (range === null) {
      switch (mode) {
        case 'cursor':
          return new Promise(result => {
            result(index.openCursor());
          });
        case 'all':
          return new Promise(result => {
            result(basicRequest(index.getAll()));
          });
        case 'count':
          return new Promise(result => {
            result(basicRequest(index.count()));
          });
      }
    } else {
      switch (mode) {
        case 'cursor':
          return new Promise(result => {
            result(basicRequest(index.openCursor(range)));
          });
        case 'all':
          return new Promise(result => {
            result(basicRequest(index.getAll(range)));
          });
        case 'count':
          return new Promise(result => {
            result(basicRequest(index.count(range)));
          });
      }
    }
  } else console.log('index ' + table.keyPath + ' not found');
}
/**
 * Adds the basic Request fucntionality to save code,
 * used by any IDBRequest
 * @param {IDBRequest} request
 * @return {Array} result of the request
 **/
export function basicRequest(request) {
  return new Promise(result => {
    //console.log("basic request");
    request.onsuccess = function(event) {
      //console.log(event.target.result);
      return result(event.target.result);
    };
    request.onerror = function(event) {
      console.log('error' + JSON.stringify(event));
      return result;
    };
  });
}
/**
 * Makes a database request with bounds only call with call
 * call example: bounded.call({x:'a', y:'z',includeY:false},'someIndex');
 * All keys from someIndex = x && < y
 * Required
 * @param {string} table from tables structures {project}.object_stores.{table}
 * @param {string} index in witch to make the request
 * @param {string} mode cursor|all|count
 * @return {Array} result of the request
 **/
export function all(table, indexName, mode) {
  return new Promise(result => {
    result(basicQuery(table, indexName, mode));
  });
}
