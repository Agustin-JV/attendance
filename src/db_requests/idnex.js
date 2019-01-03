 
 import { getData, getMoreData, getDocument } from './fbGetPaginatedData';
 import {
  mergeArrays,
  isEmpty,
  isAny,
  objectForEach,
} from './utils';

import {
  updateShiftsData,

} from './actions';
 /**
   * @param {number} [year]
   * @param {number} [month]
   */
  const getShifstsData = (year, month) => {
    let { users } = this.state;
    let retrieveCount = users.length > 0 ? users.length : 50;
    let path = 'wsinf/' + year + '/' + month;
    getData(path, retrieveCount, this.processShiftQuery, year, month);
  };
  /**
   * @param {number} [year]
   * @param {number} [month]
   */
  const getShifstsMoreData = (year, month) => {
    let path = 'wsinf/' + year + '/' + month;
    getMoreData(
      path,
      50,
      this.processShiftQuery,
      this.state.lastShiftEntry,
      year,
      month
    );
  };
  /**
   * @param {any} snapshot
   * @param {number} year
   * @param {number} month
   * @return {Promise} emty
   */
 const processShiftQuery = (snapshot, year, month) => {
    let lastVisible = snapshot.docs[snapshot.docs.length - 1];
    let { entrys, lastShiftEntry, pendingUpdate } = this.state;

    snapshot.docs.forEach(user => {
      entrys = this.setEntrys(entrys, year, month, user.id, user.data().m);
    });
    
    return new Promise(resolve => {
      
          resolve();
         
    });
  };