import tableStructures from './table_structures.json';
import { bounded } from './idb_querys';
import * as db from './database_references';
let initialized = false;
let dbIni = {
  attendance: false,
  attendancefb: false
};

export function loadAll() {
  load(tableStructures.attendance);
  load(tableStructures.attendancefb);
}
function checkInitialized() {
  if (dbIni.attendance && dbIni.attendancefb) {
    //&& dbIni.entrys && dbIni.weeks) {
    initialized = true;
    console.log('initialized ' + initialized);
  }
}
function load(recipe) {
  let request = indexedDB.open(recipe.db);
  request.onerror = function(event) {
    console.log('error' + JSON.stringify(event));
  };
  request.onsuccess = function(event) {
    // store the result of opening the database in the db
    db[recipe.db] = request.result;
    dbIni[recipe.db] = true;
    checkInitialized();
  };
  request.onupgradeneeded = function() {
    let newDb = request.result;
    newDb.onerror = function(event) {
      console.log('Error loading ' + recipe.db + ' Data Base');
    };
    for (let objs in recipe.object_stores) {
      // Create an objectStore for this database
      var objectStore = newDb.createObjectStore(recipe.object_stores[objs].name, {
        keyPath: recipe.object_stores[objs].keyPath,
        autoIncrement: recipe.object_stores[objs].autoIncrement
      });
      // define what data items the objectStore will contain
      for (let code in recipe.object_stores[objs].indices) {
        if (typeof recipe.object_stores[objs].indices[code] === 'object') {
          objectStore.createIndex(code, recipe.object_stores[objs].indices[code].indices, {
            unique: recipe.object_stores[objs].indices[code].unique
          });
        } else
          objectStore.createIndex(code, code, {
            unique: recipe.object_stores[objs].indices[code]
          });
      }
    }

    newDb.onsuccess = function() {
      db[recipe.name] = newDb.result;
      checkInitialized();
    };
  };
}
function addData(data, recipe) {
  let objectStore = basicTransaction(recipe, 'readwrite');
  // Make a request to add our newItem object to the object store
  let objectStoreRequest = objectStore.add(data);
  return new Promise(result => {
    objectStoreRequest.onsuccess = function() {
      result(objectStoreRequest.result);
    };
    objectStoreRequest.onerror = function() {
      console.log('Add not  done due to error: ' + objectStoreRequest.error);
    };
  });
}
export function deleteAll() {
  let dbs = ['wsinf', 'weeks', 'users', 'days', 'entrys'];
  for (let x in dbs) {
    if (db[dbs[x]] != null)
      db[dbs[x]]
        .transaction([dbs[x]], 'readwrite')
        .objectStore(dbs[x])
        .clear();
  }

  for (let x in dbs) {
    let request = window.indexedDB.deleteDatabase(dbs[x]);
    console.log('deleatall: ' + dbs[x]);
    request.onerror = function(event) {
      console.log('Error deleting database.');
    };
    request.onsuccess = function(event) {
      console.log('Database deleted successfully');
      //console.log(event.result); // should be undefined
    };
  }
}
let atempts = 0;
/**
 * TODO update callers so they send the correct recipe
 * Creates the basic transaction to avoid repeating code for a given recipe
 * does not execute if the project is not initialized
 * @param {Object} recipe local to this project found on tableStructures
 * @return {IDBObjectStore} objectStore
 **/
export function basicTransaction(recipe, mode) {
  if (initialized) {
    let transaction = db[recipe.db].transaction([recipe.name], mode);
    // report on the success of the transaction completing, when everything is done
    transaction.oncomplete = function() {
      //console.log('Transaction completed: database modification finished.');
    };
    transaction.onerror = function(e) {
      //console.log('Transaction not opened due to error: ' + e.error );
    };
    return transaction.objectStore(recipe.name);
  } else {
    if (atempts < 15) {
      if (atempts === 0) loadAll();
      atempts++;
      return new Promise(function(resolve) {
        setTimeout(() => {
          let objectStore = basicTransaction(recipe, mode);
          resolve(objectStore);
        }, 2000);
      });
    } else {
      alert('could not initialize db');
    }
  }
}
/**
 * Deletes a record on the a given talbe acording to the provided recipe.
 * @thisParam {function} callback if passed
 * with call will be called passing oncomplete or onerror.
 * @param {Object} recipe local to this project found on tableStructures.
 * @param {String} key | id of the record you want to update.
 * @param {Object} the new data you want to add.
 **/
export function deleteItem(recipe, key) {
  let objectStore = basicTransaction(recipe, 'readwrite');
  let request = objectStore.delete(key);
  // report that the data item has been deleted
  request.oncomplete = function() {
    console.log(recipe.name + ' ' + key + ' deleted.');
  };
  request.onerror = function() {
    console.log(recipe.name + ' ' + key + 'Error deleted.');
  };
}
/**
 * Updates a record on the a given talbe acording to the provided recipe.
 * @param {Object} recipe local to this project found on tableStructures.
 * @param {Object} the new data you want to add.
 * @param {String} key | id of the record you want to update. dont use if you spesified a key path
 **/
function updateData(recipe, data, key) {
  let objectStore = basicTransaction(recipe, 'readwrite');
  let updateRequest = objectStore.put(data, key);
  return new Promise(result => {
    updateRequest.onsuccess = function() {
      result(updateRequest.result);
    };
    updateRequest.onerror = function() {
      result('error');
      console.log(recipe.name + ' ' + key + 'Error update.' + updateRequest.error);
    };
  });
}
export function get(recipe, key) {
  return new Promise(result => {
    // Make a request to get a record by key from the object store
    var objectStoreRequest = basicTransaction(recipe, 'readonly').get(key);

    objectStoreRequest.onsuccess = function(event) {
      result(objectStoreRequest.result);
    };
  });
}
/**
 * Adds object to the database or updates it if it allready exist on the spesified table,
 * it check on the spesified index if there are any coinidence for the update.
 * returns the its key.
 * @param {Object} object  the new data you want to add. or update.
 * @param {Object} query   example user.name or **only for compound keys**-> [index1:a,idnex2:b,...] .
 * @param {Object} recipe  of the object.
 * @param {String} index   the index on witch to preform the query.
 * @return {String} key
 **/
export async function addUpdate(object, query, recipe, idex) {
  let result = await bounded.call(
    {
      z: query
    },
    recipe,
    idex,
    'all'
  );
  if (result !== undefined && result.length === 1) {
    let newObject = Object.assign({}, result[0], object);
    if (JSON.stringify(result[0]) === JSON.stringify(newObject)) {
      return result[0][recipe.keyPath];
    }
    let responce = await updateData(recipe, newObject);
    //responce => key or 'error' error if there was a problem when updating
    if (responce === 'error') {
      console.error('206 there was an error while updating: ' + JSON.stringify(object));
    }
    return result[0][recipe.keyPath];
  } else if (result !== undefined && result.length >= 1) {
    console.warn('duplicated data , something went wrong indexddb_tools :210');
  } else {
    return addData(object, recipe);
  }
}
