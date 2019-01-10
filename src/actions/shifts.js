import * as types from '../constants/ActionTypes';
import { ONGOING, COMPLETE, FAIL } from '../constants/LoadingStatusTypes';
import { downloadloading } from './index';
//#region SHIFT ACTIONS
export const updateShiftsData = (lastShift, data, year, month) => ({
  type: types.UPDATE_SHIFTS_DATA,
  data,
  year,
  month,
  lastShift
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

export const onShiftRetrieveSucces = (
  dispatch,
  snapshot,
  lastShift,
  { year, month }
) => {
  //We have to send only the relevant data to de reducer otherwise it will go crazy and will also send errors
  let shifts = snapshot.docs.map(obj => {
    return { id: obj.id, data: obj.data().m };
  });
  dispatch(updateShiftsData(lastShift, shifts, year, month));
  dispatch(downloadloading('download_shifts', COMPLETE));
  return Promise.resolve();
};
