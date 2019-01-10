import * as types from '../constants/ActionTypes';
import { ONGOING, COMPLETE, FAIL } from '../constants/LoadingStatusTypes';
import { downloadloading } from './index';

//#region   CALENDAR ACTIONS
export const updateCalendarData = (data, year) => ({
  type: types.UPDATE_CALENDAR_DATA,
  data,
  year
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

export const onCalendarRetrieveSucces = (dispatch, snapshot, { year }) => {
  let yearObj = snapshot.data();
  let data = [];
  if (yearObj)
    data = yearObj.h.map(holiday => {
      return {
        date: holiday.date.toDate(),
        name: holiday.name,
        official: holiday.official
      };
    });
  dispatch(updateCalendarData({ [year]: data }));
  dispatch(downloadloading('download_calendar', COMPLETE));
  return Promise.resolve();
};
