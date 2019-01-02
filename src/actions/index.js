import * as types from "../constants/ActionTypes";

//#region USER ACTIONS
export const updateUsersData = data => ({
  type: types.UPDATE_USERS_DATA,
  data
});

export const createUserData = (id,data) => ({
  type: types.CREATE_USER_DATA ,
  id,
  data,
});

export const updateUserData = (id, data) => ({
  type: types.UPDATE_USER_DATA,
  id,
  data
});

export const deleteUserData = (id, data) => ({
  type: types.DELETE_USER_DATA ,
  id
});
//#endregion

//#region SHIFT ACTIONS
export const updateShiftsData = (year,month,data) => ({
  type: types.UPDATE_SHIFTS_DATA,
  data
});

export const createShiftData = (year,month,id,data) => ({
  type: types.CREATE_SHIFT_DATA  ,
  id,
  data,
});

export const updateShiftData = (year,month,id, data) => ({
  type: types.UPDATE_SHIFT_DATA ,
  id,
  data
});

export const deleteShiftData = (year,month,id, data) => ({
  type: types.DELETE_SHIFT_DATA  ,
  id
});
//#endregion

//#region   CALENDAR ACTIONS
export const updateCalendarData = data => ({
  type: types.UPDATE_CALENDAR_DATA ,
  data
});

export const createCalendarEntry = (data) => ({
  type: types.CREATE_CALENDAR_ENTRY   ,
  data,
});

export const updateCalendarEntry = (data) => ({
  type: types.UPDATE_CALENDAR_ENTRY  ,
  data
});

export const deleteCalendarEntry = (data) => ({
  type: types.DELETE_CALENDAR_ENTRY   ,
  data
});
//#endregion

//#region   AppSettings
export const updateAppSettings = data => ({
  type: types.UPDATE_APP_SETTINGS  ,
  data
});
//#endregion