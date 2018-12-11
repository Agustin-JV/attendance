//@ts-check

//#region IMPORTS
import React, { Component } from 'react';
import 'react-big-scheduler/lib/css/style.css';
import BigCalendar from './bigCalendar';
import moment from 'moment';
import withDragDropContext from './withDnDContext';
import { withStyles } from '@material-ui/core/styles';
import * as colors from '@material-ui/core/colors';
import { Typography, CardContent, CardActions, IconButton, Card, Button } from '@material-ui/core';
import { Save, Edit, Forward } from '@material-ui/icons';
import ShiftSelect from './shiftSelect';
import AvChip from './avatarChip';
import Pagination from './pagination';
import {
  getMonth,
  mergeArrays,
  isEmpty,
  isAny,
  objectForEach,
  arrayMatchPattern,
  arrayBuildComplexPattern
} from './utils';
import { getData, getMoreData, getDocument } from './fbGetPaginatedData';
import shift_colors from './shift_colors.json';
import { db } from './fire_init';
import { handleFile, XLSX } from './loadXlsx';
//#endregion
//#region TS annotations
/**
 * @typedef  {Object}           State
 * @property {Object}           viewModel
 * @property {{}}           pendingUpdate
 * @property {Array}          visibleUsers
 * @property {Array}           users
 * @property {Oject}           entrys
 * @property {HolidayObjectArr} holidays
 * @property {Object}          currentEvent
 */
/**
 * @typedef   {Object}  HolidayObject
 * @property  {string}  name
 * @property  {Date}    date
 * @property  {String} official 'O':Official Holdiay OH, 'N':None Workable NH, 'C' Commemorative Holiday H.
 */

/**
 * @typedef {{[year:number]:HolidayObject[]}}  HolidayObjectArr
 */
//#endregion
class UserShifts extends Component {
  constructor(props) {
    super(props);
    //set events here or later,
    //the event array should be sorted in ascending order by event.start property, otherwise there will be some rendering errors
    /** @type {State} */
    this.state = {
      viewModel: null,
      anchorEl: null,
      open: false,
      currentEvent: null,
      newEvent: null,
      enableEdit: false,
      pendingSave: true,
      rowsPerPage: 5,
      page: 1,
      loading: { load: false, upload: false, save: false },
      pendingUpdate: {},
      visibleUsers: [],
      users: [],
      entrys: {},
      holidays: {},
      isHoldiDay: false,
      isOfficialHoliday: false,
      startDate: {
        year: moment().get('year'),
        month: moment().get('month') + 1
      },
      endDate: {
        year: moment().get('year'),
        month: moment().get('month') + 1
      }
    };
  }
  paginationRef = null;
  calendarRef = null;
  setLoading(key, value) {
    let { loading } = this.state;
    loading[key] = value;
    this.setState({ loading });
  }
  //#region render
  render() {
    const { enableEdit, events, open, pendingUpdate, isOfficialHoliday, isHoldiDay } = this.state;
    const { classes } = this.props;
    let { showNS, showMS } = this.activateOptions();
    let save = Object.keys(pendingUpdate).length > 0;
    return (
      <Card style={{ width: 1050 }}>
        {save || enableEdit ? (
          <CardContent
            style={{
              backgroundColor: save ? colors['amber'][500] : colors['lime'][500]
            }}>
            <Typography variant="title">
              {enableEdit ? 'Edition is enabled' : ''}
              {save ? <b> Pending Save</b> : null}
              {save ? (
                <IconButton aria-label="Add to favorites" onClick={this.onSave}>
                  <Save fontSize="small" />
                </IconButton>
              ) : null}
            </Typography>
          </CardContent>
        ) : null}
        <CardContent style={{ paddingTop: '0%', paddingBottom: '0%' }}>
          <BigCalendar
            ref={ref => (this.calendarRef = ref)}
            setDateRange={this.setDateRange}
            onEditEvent={this.onEditEvent}
            onDeleteEvent={this.onDeleteEvent}
            onNewEvent={this.onNewEvent}
            onUdateStart={this.onUdateStart}
            onUpdateEnd={this.onUpdateEnd}
            setViewModel={this.setViewModel}
            events={events}
            calcHolidays={this.calcHolidays}
            editable={enableEdit}
          />
        </CardContent>
        {this.footer()}
        <ShiftSelect
          open={open}
          showMS={showMS}
          showNS={showNS}
          isHoldiDay={isHoldiDay}
          isOfficialHoliday={isOfficialHoliday}
          onClick={this.changeTo}
          onClose={this.onCloseShiftSelect}
        />
      </Card>
    );
  }
  footer = () => {
    const { loading } = this.state;
    let save = Object.keys(this.state.pendingUpdate).length > 0;
    return (
      <CardActions style={{ paddingTop: '0%' }} disableActionSpacing>
        <Pagination
          ref={ref => (this.paginationRef = ref)}
          rows={this.state.users.length}
          onPageChange={this.handleChangePage}
          onGoNext={this.onGoNext}
          onGoLast={this.onGoLast}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
        <span>
          <AvChip
            color={save ? 'blue' : 'grey'}
            avatar={<Save />}
            label="Save"
            clickable={save}
            loading={loading['save']}
            onClick={this.onSave}
            hide={!this.state.enableEdit}
          />{' '}
          <input
            accept=".xlsx"
            style={{ display: 'none' }}
            id="contained-button-file"
            multiple
            type="file"
            onChange={this.loadFile}
          />
          <label htmlFor="contained-button-file">
            <AvChip
              cAr={['green', 700, 900]}
              avatar={<Forward style={{ transform: 'rotate(-90deg)' }} />}
              label="Upload File"
              clickable={true}
              loading={loading['upload']}
              hide={!this.state.enableEdit}
            />
          </label>
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <AvChip
            cAr={this.state.enableEdit ? ['indigo', 400, 700] : ['grey', 500, 700]}
            theme={this.state.enableEdit ? 'white' : 'black'}
            avatar={<Edit />}
            variant={this.state.enableEdit ? 'default' : 'outlined'}
            label={this.state.enableEdit ? 'Diavtivate Edit' : 'Enable Edit'}
            onClick={this.toggleEdit}
            clickable={true}
          />
        </div>
      </CardActions>
    );
  };
  //#endregion

  //#region UploadFile
  loadFile = e => {
    this.setLoading('upload', true);
    handleFile(this.fileCallback)(e);
  };
  fileCallback = wb => {
    console.log('fileCallback', wb);
    if (wb !== undefined) {
      var ws = wb.Sheets[wb.SheetNames[0]];
      var data = XLSX.utils.sheet_to_json(ws, {
        header: 1
      });
      this.processData(data);
    } else {
      this.setLoading('upload', false);
    }
  };
  processData = data => {
    let pattern = arrayBuildComplexPattern({
      '0': 'string|number',
      '1': 'number',
      '2': 'string',
      '3-33': 'string|undefined'
    });
    let batch = [];
    for (let x in data) {
      if (!isEmpty(data[x])) {
        let matchPattern = arrayMatchPattern(data[x], pattern);
        let info = data[x].splice(0, 3);
        if (matchPattern) {
          let days = Object.assign({}, data[x]);
          for (let day in days) {
            batch.push({
              userId: info[0],
              code: days[day].toUpperCase(),
              date: new Date(info[1], getMonth(info[2], true), Number(day) + 1)
            });
          }
        }
      }
    }
    if (batch.length > 0) {
      this.batchUpdate(batch);
    }
    this.setLoading('upload', false);
  };
  //#endregion

  //#region BigCalendar
  setDateRange = (startDate, endDate) => {
    this.setState(
      {
        startDate: {
          year: startDate.getUTCFullYear(),
          month: startDate.getUTCMonth()
        },
        endDate: {
          year: endDate.getUTCFullYear(),
          month: endDate.getUTCMonth()
        }
      },
      () => {
        let { startDate, endDate } = this.state;
        if (startDate.year !== endDate.year && startDate.month !== endDate.month)
          this.getShifstsData(endDate.year, endDate.month);
        this.getShifstsData(startDate.year, startDate.month);
      }
    );
  };
  onEditEvent = event => {
    if (event.editable) {
      let activeHoliday = this.getActiveHolidays(event.start, event.end);
      let isOfficialHoliday,
        isHoliday = false;
      if (activeHoliday[0] !== undefined) {
        isOfficialHoliday = activeHoliday[0].official === 'O';
        isHoliday = activeHoliday[0].official === 'C';
      }
      this.setState({
        currentEvent: event,
        open: true,
        pendingSave: true,
        isOfficialHoliday,
        isHoliday
      });
    }
  };
  onDeleteEvent = event => {
    if (event.editable) {
      let { viewModel } = this.state;
      viewModel._detachEvent(event);
      viewModel._createRenderData();
      this.setState({
        pendingSave: true
      });
      let activeHoliday = this.getActiveHolidays(event.start, event.end);
      if (activeHoliday[0] !== undefined) {
        this.onUpdate(
          event.resourceId,
          holidayCodes[activeHoliday[0].official].code,
          event.start,
          event.end
        ).then(this.buildVisibleShifts());
      }
    }
  };
  onNewEvent = (id, start, end) => {
    if (this.state.enableEdit) {
      let newEvent = this.generateEvent(id, start, end, 'O');
      this.setState({
        open: true,
        newEvent: newEvent,
        pendingSave: true
      });
    }
  };
  onUdateStart = async (event, newStart) => {
    return await this.onUpdateEventLenght(event, newStart, event.end, event.start, newStart, false);
  };
  onUpdateEnd = async (event, newEnd) => {
    return await this.onUpdateEventLenght(event, event.start, newEnd, newEnd, event.end, true);
  };
  onUpdateEventLenght = (event, start, end, delStart, delEnd, flip) => {
    event = this.eventRules(event, event.title, start, end);
    this.onDeleteRemaining(event, delStart, delEnd, flip);
    this.onEdit(event, start, end);
    return new Promise(resolve => {
      this.setState(
        {
          pendingSave: true
        },
        resolve(event)
      );
    });
  };
  setViewModel = viewModel => {
    this.setState({ viewModel });
  };
  //#endregion

  activateOptions = () => {
    let { newEvent, currentEvent } = this.state;
    let actual = newEvent || currentEvent;
    if (actual) {
      let start = moment(actual.start);
      let end = moment(actual.end);
      let lenght = end.diff(start, 'days');
      let showNS = lenght > 0 ? false : true;
      let showMS = isAny(start.day(), [0, 6]) && isAny(end.day(), [0, 6]);
      showMS = lenght > 1 ? false : showMS;
      return { showNS, showMS };
    }
    return { showNS: false, showMS: false };
  };
  componentDidMount = () => {
    this.getShifts();
    this.getHolidaysData(new Date().getFullYear());
  };
  onGoLast = () => {
    this.getMoreShifts();
  };
  handleChangePage = page => {
    this.getVisibleUsers(page, this.state.rowsPerPage);
    this.setState({ page: page });
  };
  handleChangeRowsPerPage = rowsPerPage => {
    this.getVisibleUsers(this.state.page, rowsPerPage);
    this.setState({
      rowsPerPage: rowsPerPage
    });
  };
  toggleEdit = event => {
    let { enableEdit } = this.state;
    this.setState({ enableEdit: !enableEdit });
    console.log('toggleEdit', this.calendarRef);
    this.calendarRef.child.updateSchedulerSetings();
  };
  onCloseShiftSelect = () => {
    this.setState({
      open: false,
      newEvent: null,
      isOfficialHoliday: false,
      isHoliday: false
    });
  };
  getShifts = () => {
    let { startDate, endDate } = this.state;
    this.getUsersData();
    if (startDate.month === endDate.month) {
      this.getShifstsData(startDate.year, startDate.month);
    } else {
      this.getShifstsData(startDate.year, startDate.month);
      this.getShifstsData(endDate.year, endDate.month);
    }
  };
  getMoreShifts = () => {
    let { startDate, endDate } = this.state;
    this.getUsersMoreData();
    if (startDate.month === endDate.month) {
      this.getShifstsMoreData(startDate.year, startDate.month);
    } else {
      this.getShifstsMoreData(startDate.year, startDate.month);
      this.getShifstsMoreData(endDate.year, endDate.month);
    }
  };
  onSave = () => {
    let { entrys } = this.state;
    this.setState({ pendingUpdate: {} });
    this.setLoading('save', true);
    var batch = db.batch();
    objectForEach(entrys, (year, months) => {
      objectForEach(months, (month, users) => {
        for (let user in users) {
          var userRef = db.collection('wsinf/' + year + '/' + month).doc(user);
          batch.set(userRef, { m: users[user].shifts });
        }
      });
    });
    // Commit the batch
    batch.commit().then(function() {
      this.setLoading('save', false);
      console.log('succesfull save');
    });
  };

  /**
   * Gets the holidays that occur on a given time frame
   * @param {Date} start
   * @param {Date} end
   * @return {HolidayObject[]}
   * */
  getActiveHolidays = (start, end) => {
    let [s, e] = [new Date(start), new Date(end)];
    let [utcStart, utcEnd] = [
      new Date(Date.UTC(s.getFullYear(), s.getMonth(), s.getDate())),
      new Date(Date.UTC(e.getFullYear(), e.getMonth(), e.getDate()))
    ];
    const { holidays } = this.state;
    let activeHolidays = [];

    if (holidays[utcStart.getFullYear()] !== undefined)
      holidays[utcStart.getFullYear()].forEach(holiday => {
        if (holiday.date >= utcStart && holiday.date <= utcEnd) {
          activeHolidays.push(holiday);
        }
      });

    return activeHolidays;
  };
  calcHolidays = schedulerData => {
    let { viewModel } = this.state;
    if (schedulerData !== undefined) viewModel = schedulerData;
    let { startDate, endDate, events } = viewModel;
    let activeHolidays = this.getActiveHolidays(startDate, endDate);
    let updateEvents = [];
    if (activeHolidays.length > 0) {
      let renderData = viewModel.renderData;
      renderData.forEach(slot => {
        slot.headerItems.forEach(day => {
          let date = new Date(day.start);
          let holiday = false;
          activeHolidays.forEach(_holiday => {
            if (date.getDate() === _holiday.date.getUTCDate()) holiday = _holiday;
          });
          if (holiday) {
            let event = day.events[0];
            if (event !== undefined) {
              let code = event.eventItem.title;
              let newCode = this.doesNeedCodeCorrection(code, holidayCodes[holiday.official].code);
              if (newCode) {
                updateEvents.push({ userId: slot.slotId, code: newCode, date: date });
              }
            } else {
              let newEvent = this.generateEvent(
                slot.slotId,
                moment(date).format('Y-M-D HH:mm:ss'),
                moment(date).format('Y-M-D 23:59:59'),
                holidayCodes[holiday.official].code
              );
              events.push(newEvent);
            }
          }
        });
      });

      viewModel.setEvents(events);
      this.setState({ events, viewModel }, () => {
        if (updateEvents.length > 0) this.batchUpdate(updateEvents);
      });
    }
  };

  doesNeedCodeCorrection(code, holidayCode) {
    if (holidayCode === code) {
      return false;
    } else {
      if (holidayCode === 'OH') {
        if (isAny(code, ['S', 'NS', 'MS'])) {
          const convertion = { MS: 'MHS', S: 'HS', NS: 'NHS' };
          return convertion[code];
        }
        if (isAny(code, ['MHS', 'HS', 'NHS'])) {
          return false;
        }
        return 'OH';
      }
      if (holidayCode === 'H') {
        if (isAny(code, ['S', 'NS', 'MS'])) {
          return false;
        } else if (isAny(code, ['MHS', 'HS', 'NHS'])) {
          return { MHS: 'MS', HS: 'S', NHS: 'NS' }[code];
        }
      }
      return holidayCode;
    }
  }

  /**
   * Generates Event with the given data and retuns it
   * @param {string} resourceId
   * @param {string} start format('Y-M-D HH:mm:ss')
   * @param {string} end  format('Y-M-D HH:mm:ss')
   * @param {String} code 'S, O, SE'
   * @return {Object} result
   */
  generateEvent = (resourceId, start, end, code) => {
    let s = new Date(start);
    let e = new Date(end);
    let { editable, movable, resizable } = this.getEventProperties(code);
    return {
      id: resourceId + '-' + s.valueOf() + '-' + e.valueOf(),
      title: code,
      start: start,
      end: end,
      resourceId: resourceId,
      bgColor: colors[shift_colors[code]][800],
      editable,
      movable,
      resizable
    };
  };

  getEventProperties(code) {
    let editable = true;
    let movable = true;
    let resizable = true;
    if (isAny(code, ['NH', 'H', 'OH', 'HS', 'HMS', 'NHS'])) {
      movable = false;
      resizable = false;
      if (code === 'NH') {
        editable = false;
      }
    }
    return { editable, movable, resizable };
  }

  //#region User Server Fetch
  /** fetchs for the users to fill the resource column */
  getUsersData = () => {
    getData('users', 50, this.processUsersQuery);
  };
  /** continue fetching for the users from the last one to fill the resource column */
  getUsersMoreData = () => {
    getMoreData('users', 50, this.processUsersQuery, this.state.lastRow);
  };
  /**
   * @param {any} [snapshot]
   * @return {Promise} emty
   */
  processUsersQuery = snapshot => {
    let lastVisible = snapshot.docs[snapshot.docs.length - 1];
    let data = snapshot.docs.map(snapshot => {
      let { sap_id, name } = snapshot.data();
      return { id: sap_id, name: name };
    });
    let { lastRow, users } = this.state;
    users = mergeArrays(data, users, 'id');
    //sort by name
    users.sort(function(a, b) {
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
    });
    return new Promise(resolve => {
      this.setState(
        {
          users: users,
          lastRow: lastVisible ? lastVisible : lastRow
        },
        () => {
          this.getVisibleUsers(this.state.page, this.state.rowsPerPage);
          this.paginationRef.forceUpdateRows();
          resolve();
        }
      );
    });
  };
  // #endregion

  //#region Shifts Serfer Fetch & build
  /**
   * @param {number} [year]
   * @param {number} [month]
   */
  getShifstsData = (year, month) => {
    let { users } = this.state;
    let retrieveCount = users.length > 0 ? users.length : 50;
    let path = 'wsinf/' + year + '/' + month;
    getData(path, retrieveCount, this.processShiftQuery, year, month);
  };
  /**
   * @param {number} [year]
   * @param {number} [month]
   */
  getShifstsMoreData = (year, month) => {
    let path = 'wsinf/' + year + '/' + month;
    getMoreData(path, 50, this.processShiftQuery, this.state.lastShiftEntry, year, month);
  };
  /**
   * @param {any} snapshot
   * @param {number} year
   * @param {number} month
   * @return {Promise} emty
   */
  processShiftQuery = (snapshot, year, month) => {
    let lastVisible = snapshot.docs[snapshot.docs.length - 1];
    let { entrys, lastShiftEntry, pendingUpdate } = this.state;

    snapshot.docs.forEach(user => {
      entrys = this.setEntrys(entrys, year, month, user.id, user.data().m);
    });
    //merge pending update with the fetch data to keep the changes made
    objectForEach(pendingUpdate, (year, months) => {
      objectForEach(months, (month, users) => {
        for (let user in users) {
          this.setEntrys(entrys, year, month, user, users[user].shifts);
        }
      });
    });
    return new Promise(resolve => {
      this.setState(
        {
          entrys: entrys,
          lastShiftEntry: lastVisible ? lastVisible : lastShiftEntry
        },
        () => {
          resolve();
          this.buildVisibleShifts();
        }
      );
    });
  };
  /** Geterates only the shifts for the visible users */
  buildVisibleShifts = () => {
    let { entrys, viewModel } = this.state;
    let events = [];
    let renderData = viewModel.renderData;
    let visubleUsers = renderData.map(slot => {
      return slot.slotId;
    });

    visubleUsers.forEach(user => {
      objectForEach(entrys, (year, months) => {
        objectForEach(months, (month, users) => {
          if (users[user] !== undefined)
            events.push(...this.groupSameAdjasentDays(user, year, month, users[user].shifts));
        });
      });
    });

    this.setState({ events }, () => {
      viewModel.setEvents(events);
      this.calcHolidays(viewModel);
    });
  };

  /**
   * @param {string | number} [sap_id]
   * @param {number} [year]
   * @param {number} [month]
   * @param {Array<any>} [days]
   * @return {Array<any>} from generateEvent
   */
  groupSameAdjasentDays(sap_id, year, month, days) {
    let output = [];
    let prev = -1;
    for (let x = 1; x < 31; x++) {
      if (days[x] !== null && days[x + 1] !== null && days[x] === days[x + 1]) {
        if (prev === -1) prev = x;
      } else {
        if (days[x] !== '' && days[x] !== null && days[x] !== undefined) {
          //console.log('day',x)
          let start = moment(new Date(year, month - 1, prev !== -1 ? prev : x, 0, 0, 0)).format(
            'Y-M-D HH:mm:ss'
          );
          let end = moment(new Date(year, month - 1, x, 23, 59, 59)).format('Y-M-D HH:mm:ss');
          output.push(this.generateEvent(sap_id, start, end, days[x]));
        }
        prev = -1;
      }
    }
    return output;
  }
  //#endregion

  onDeleteRemaining = (event, start, end, reverse) => {
    let daysBetween = moment(start).diff(moment(end), 'days');
    if (daysBetween < 0) {
      if (reverse) {
        [start, end] = [end, start];
      }
      let d = new Date(end);
      d.setDate(d.getDate() + (reverse ? 1 : -1));
      if (reverse) {
        [d, start] = [start, d];
      }
      this.onDelete(event, start, d);
    }
  };
  onEdit = (event, start, end) => {
    let sap_id = event.resourceId;
    let code = event.title;
    this.onUpdate(sap_id, code, start, end);
  };
  onDelete = (event, start, end) => {
    let sap_id = event.resourceId;
    this.onUpdate(sap_id, '', start, end);
  };
  onUpdate = (userId, code, start, end) => {
    let { pendingUpdate, entrys } = this.state;
    let daysBetween = moment(end).diff(moment(start), 'days');
    for (let i = 0; i <= daysBetween; i++) {
      let d = new Date(start);
      d.setDate(d.getDate() + i);
      let year = d.getFullYear();
      let month = d.getMonth() + 1;
      pendingUpdate = this.setEntry(pendingUpdate, year, month, userId, d.getDate(), code);
      entrys = this.setEntry(entrys, year, month, userId, d.getDate(), code);
    }

    return new Promise(resolve => {
      this.setState({ pendingUpdate, entrys, pendingSave: true }, () => resolve());
    });
  };

  getEntry = (entrys, year, month, userId, date) => {
    entrys[year] = entrys[year] || {};
    entrys[year][month] = entrys[year][month] || {};
    entrys[year][month][userId] = entrys[year][month][userId] || {};
    entrys[year][month][userId]['shifts'] = entrys[year][month][userId]['shifts'] || {};
    if (date !== undefined) return entrys[year][month][userId]['shifts'][date];
  };
  setEntrys = (entrys, year, month, userId, data) => {
    this.getEntry(entrys, year, month, userId);
    entrys[year][month][userId]['shifts'] = data;
    return entrys;
  };
  setEntry = (entrys, year, month, userId, date, code) => {
    this.getEntry(entrys, year, month, userId);
    entrys[year][month][userId]['shifts'][date] = code;
    return entrys;
  };
  batchUpdate = batch => {
    let { pendingUpdate, entrys } = this.state;

    batch.forEach(({ userId, code, date }) => {
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      pendingUpdate = this.setEntry(pendingUpdate, year, month, userId, date.getDate(), code);
      entrys = this.setEntry(entrys, year, month, userId, date.getDate(), code);
    });

    this.setState({ pendingUpdate, entrys }, this.buildVisibleShifts(true));
  };
  getVisibleUsers = (page, rowsPerPage) => {
    let { users } = this.state;
    let visibleUsers = [].concat(users).splice((page - 1) * rowsPerPage, rowsPerPage);
    this.state.viewModel.setResources(visibleUsers);
    this.buildVisibleShifts();
  };
  /**
   * Updates the event and also updates the pending save ones as well as finishing the new event process
   */
  changeTo = code => () => {
    let e = this.state.currentEvent;
    if (this.state.newEvent) {
      e = this.state.newEvent;
    }

    if (e.editable) {
      e = this.eventRules(e, code, e.start, e.end);
    }
    if (this.state.newEvent) {
      this.state.viewModel.addEvent(e);
    }
    this.onEdit(e, e.start, e.end);
    this.setState({
      currentEvent: null,
      open: false,
      newEvent: null
    });
  };
  /**
   * Changes color, and adds propertyes acording event type
   * @param {object} e event
   * @param {string} code shift code
   * @param {string} start string date
   * @param {string} end string date
   */
  eventRules = (e, code, start, end) => {
    e.title = code;

    start = moment(start);
    end = moment(end);
    let lenght = end.diff(start, 'days');
    if (code === 'NS') {
      e.resizable = false;
    } else {
      e.resizable = true;
    }
    if (code === 'MS') {
      e.movable = lenght >= 1 ? false : true;
      if (lenght > 1 || (!isAny(start.day(), [0, 6]) || !isAny(end.day(), [0, 6]))) {
        e.title = 'S';
        code = 'S';
        e.movable = true;
      }
    }
    if (isAny(code, ['H', 'OH', 'HMS', 'HS', 'NH'])) {
      e.movable = false;
      e.resizable = false;
    }
    e.bgColor = colors[shift_colors[code]][800];
    return e;
  };

  //#region Holiday Server Fetch
  /**
   * @param {number} year
   */
  getHolidaysData = year => {
    this.setLoading('load', true);
    getDocument('holidays', year.toString(), this.processHolidaysQuery, year);
  };

  /**
   * @param {any} snapshot
   * @param {number} year
   * @return {Promise} emty
   */
  processHolidaysQuery = (document, year) => {
    let data = document.data().h.map(holiday => {
      return { date: holiday.date.toDate(), name: holiday.name, official: holiday.official };
    });
    let { holidays } = this.state;

    holidays[year] = data;

    return new Promise(resolve => {
      this.setState({ holidays }, () => {
        resolve();
        this.calcHolidays();
        this.setLoading('load', false);
      });
    });
  };
  //#endregion
}

const styles = theme => ({
  button: {
    margin: theme.spacing.unit
  },
  paper: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4
  },
  cClip: {
    color: theme.palette.common.white
  }
});
const holidayCodes = {
  O: {
    code: 'OH'
  },
  N: {
    code: 'NH'
  },
  C: {
    code: 'H'
  }
};

export default withStyles(styles)(withDragDropContext(UserShifts));
