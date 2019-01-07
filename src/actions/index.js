import * as types from '../constants/ActionTypes';
import { getData, getMoreData, getDocument } from '../fbGetPaginatedData';
import {
  mergeArrays,
  isEmpty,
  isAny,
  objectForEach,
  actOnObjectElement
} from '../utils';
import { ONGOING, COMPLETE, FAIL } from '../constants/LoadingStatusTypes';
//#region USER ACTIONS
export const updateUsersData = (data, lastUser, func) => ({
  type: types.UPDATE_USERS_DATA,
  data,
  lastUser,
  func
});

export const createUserData = (id, data) => ({
  type: types.CREATE_USER_DATA,
  id,
  data
});

export const updateUserData = (id, data) => ({
  type: types.UPDATE_USER_DATA,
  id,
  data
});

export const deleteUserData = (id, data) => ({
  type: types.DELETE_USER_DATA,
  id
});
//#endregion

//#region SHIFT ACTIONS
export const updateShiftsData = (lastShift, data) => ({
  type: types.UPDATE_SHIFTS_DATA,
  data
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

//#region   CALENDAR ACTIONS
export const updateCalendarData = data => ({
  type: types.UPDATE_CALENDAR_DATA,
  data
});

export const createCalendarEntry = (year, data) => ({
  type: types.CREATE_CALENDAR_ENTRY,
  data
});

export const updateCalendarEntry = (year, data) => ({
  type: types.UPDATE_CALENDAR_ENTRY,
  data
});

export const deleteCalendarEntry = (year, data) => ({
  type: types.DELETE_CALENDAR_ENTRY,
  data
});
//#endregion

//#region   AppSettings
export const updateAppSettings = data => ({
  type: types.UPDATE_APP_SETTINGS,
  data
});
//#endregion

//#region   Loading
export const uploadloading = (key, status) => ({
  type: types.UPLOAD,
  key,
  status
});
export function downloadloading(key, status) {
  return {
    type: types.DOWNLOAD,
    key,
    status
  };
}
export const saveloading = (key, status) => ({
  type: types.SAVE,
  key,
  status
});
export const processloading = (key, status) => ({
  type: types.PROCESS,
  key,
  status
});
//#endregion

//USE THIS TO DO THE FETCH IN ONE PASS

/**
 * @param {number} year
 * @param {number} month
 * @param {number} [retrieveCount] default 50
 */
export const getShifstsData = (year, month, retrieveCount = 50) => {
  let path = 'wsinf/' + year + '/' + month;
  return (dispatch, getState) => {
    dispatch(downloadloading('download_shifts', COMPLETE));
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
    dispatch(downloadloading('download_shifts', COMPLETE));
    getMoreData(path, 50, lastShift, year, month).then(
      onShiftRetrieveSucces(dispatch, year, month, entrys, lastShift),
      onShiftRetrieveError(dispatch)
    );
  };
};

const onShiftRetrieveSucces = (
  dispatch,
  year,
  month,
  entrys,
  lastShift
) => snapshot => {
  let lastVisible = snapshot.docs[snapshot.docs.length - 1];
  lastShift = lastVisible ? lastVisible : lastShift;
  snapshot.docs.forEach(user => {
    entrys = actOnObjectElement(
      ['shifts', user.id, month, year],
      entrys,
      user.data().m
    );
  });
  dispatch(updateShiftsData(lastShift, entrys));
  dispatch(downloadloading('download_shifts', COMPLETE));
  return Promise.resolve();
};
const onShiftRetrieveError = dispatch => error => {
  dispatch(downloadloading('download_shifts', FAIL));
};
