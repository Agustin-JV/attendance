import * as types from '../constants/ActionTypes';
import { getData, getMoreData } from '../fbGetPaginatedData';
import { actOnObjectElement } from '../utils';
import { ONGOING, COMPLETE, FAIL } from '../constants/LoadingStatusTypes';
import { downloadloading } from './index';
//#region SHIFT ACTIONS
export const updateShiftsData = (lastShift, data, year, month) => ({
  type: types.UPDATE_SHIFTS_DATA,
  data,
  year,
  month
});

export const createShiftData = (year, month, id, data) => ({
  type: types.CREATE_SHIFT_DATA,
  id,
  data
});

export const updateShiftData = (year, month, id, data) => ({
  type: types.UPDATE_SHIFT_DATA,
  id,
  data
});

export const deleteShiftData = (year, month, id, data) => ({
  type: types.DELETE_SHIFT_DATA,
  id
});
//#endregion

/**
 * @param {number} year
 * @param {number} month
 * @param {number} [retrieveCount] default 50
 */
export const getShifstsData = (year, month, retrieveCount = 50) => {
  let path = 'wsinf/' + year + '/' + month;
  return (dispatch, getState) => {
    dispatch(downloadloading('download_shifts', ONGOING));
    getData(path, retrieveCount, year, month).then(
      onShiftRetrieveSucces(dispatch, year, month, [], null),
      onShiftRetrieveError(dispatch)
    );
  };
};

/**
 * @param {number} year
 * @param {number} month
 * @param {ref} lastShift last shift provided to continue fom that one
 */
export const getShifstsMoreData = (year, month, lastShift, entrys) => {
  let path = 'wsinf/' + year + '/' + month;
  return (dispatch, getState) => {
    dispatch(downloadloading('download_shifts', ONGOING));
    getMoreData(path, 50, lastShift, year, month).then(
      //onShiftRetrieveSucces(dispatch, year, month, entrys, lastShift),
      onShiftRetrieveError(dispatch)
    );
  };
};

export const onShiftRetrieveSucces = (
  dispatch,
  snapshot,
  lastShift,
  { year, month }
) => {
  dispatch(updateShiftsData(lastShift, snapshot, year, month));
  dispatch(downloadloading('download_shifts', COMPLETE));
  return Promise.resolve();
};
const onShiftRetrieveError = dispatch => error => {
  dispatch(downloadloading('download_shifts', FAIL));
};
