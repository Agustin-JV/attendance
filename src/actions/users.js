'use strict';
import { mergeArrays } from '../utils';
import { downloadloading } from './index';
import * as types from '../constants/ActionTypes';
import { ONGOING, COMPLETE, FAIL } from '../constants/LoadingStatusTypes';
//#region USER ACTIONS
export const updateUsersData = (lastUser, data) => ({
  type: types.UPDATE_USERS_DATA,
  data,
  lastUser
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

export const deleteUserData = (id) => ({
  type: types.DELETE_USER_DATA,
  id
});
//#endregion

/**
 * @param {any} [snapshot]
 * @return {Promise} emty
 */
export const onUserRetrieveSucces = (dispatch, snapshot, lastUser, users) => {
  let data = snapshot.docs.map(snapshot => {
    let { sap_id, name } = snapshot.data();
    return { id: sap_id, name: name };
  });
  //users = mergeArrays(data, users, 'id');
  //sort by name
  /*users.sort(function(a, b) {
      var nameA = a.name.toUpperCase(); // ignore upper and lowercase
      var nameB = b.name.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      // names must be equal
      return 0;
    });*/
  dispatch(downloadloading('download_users', COMPLETE));
  dispatch(updateUsersData(lastUser, data));
  return Promise.resolve(downloadloading('download_users', COMPLETE))
};
