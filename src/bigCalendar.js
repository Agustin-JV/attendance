//@ts-check

//#region IMPORTS
import React, { Component } from 'react';
import 'react-big-scheduler/lib/css/style.css';
import Scheduler, { SchedulerData, ViewTypes, DATE_FORMAT } from 'react-big-scheduler';
import moment from 'moment';
import withDragDropContext from './withDnDContext';
import { withStyles } from '@material-ui/core/styles';
import * as colors from '@material-ui/core/colors';
import { Typography, CardContent, CardActions, IconButton, Card, Button } from '@material-ui/core';
import { Save, Edit, Delete } from '@material-ui/icons';
import ShiftSelect from './shiftSelect';
import AvChip from './avatarChip';
import Pagination from './pagination';
import { mergeArrays, mergeArraysMultyKey, isAny,objectMap ,objectForEach} from './utils';
import { getData, getMoreData, getDocument } from './fbGetPaginatedData';
import shift_colors from './shift_colors.json';
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
 * @property  {boolean} official
 * @property  {boolean} [del]
 */
/**
 * @typedef {{[year:number]:HolidayObject[]}}  HolidayObjectArr
 */
//#endregion
class BigCalendar extends Component {
  constructor(props) {
    super(props);
    let schedulerData = new SchedulerData(
      moment().format(DATE_FORMAT),
      ViewTypes.Week,
      false,
      false,
      {
        crossResourceMove: false,
        checkConflict: true,
        resourceName: 'User Name',
        taskName: 'Shift',
        agendaViewHeader: 'Agenda',
        addMorePopoverHeaderFormat: 'MMM D, YYYY dddd',
        eventItemPopoverDateFormat: 'MMM D',
        nonAgendaDayCellHeaderFormat: 'ha',
        nonAgendaOtherCellHeaderFormat: 'ddd D',
        schedulerMaxHeight: 400,
        views: [
          {
            viewName: 'Week View',
            viewType: ViewTypes.Week,
            showAgenda: false,
            isEventPerspective: false
          },
          {
            viewName: 'Month View',
            viewType: ViewTypes.Month,
            showAgenda: false,
            isEventPerspective: false
          }
        ]
      }
    );
    schedulerData.localeMoment.locale('es-mx');
    //set events here or later,
    //the event array should be sorted in ascending order by event.start property, otherwise there will be some rendering errors
    /** @type {State} */
    this.state = {
      viewModel: schedulerData,
      anchorEl: null,
      open: false,
      currentEvent: null,
      newEvent: null,
      enableEdit: false,
      pendingSave: true,
      rowsPerPage: 5,
      page: 1,
      loading: { load: false },
      pendingUpdate: {},
      visibleUsers: [],
      users: [],
      entrys: {},
      holidays: {},
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
  setLoading(key, value) {
    let { loading } = this.state;
    loading[key] = value;
    this.setState({ loading });
  }
  //#region render
  render() {
    const { viewModel, open } = this.state;
    const { classes } = this.props;
    let { showNS, showMS } = this.activateOptions();
    return (
      <Card style={{ width: 1050 }}>
        {this.state.enableEdit ? (
          <CardContent
            style={{
              backgroundColor: this.state.pendingSave ? colors['amber'][500] : colors['lime'][500]
            }}>
            <Typography variant="title">
              Edition is enabled
              {this.state.pendingSave ? <b> Pending Save</b> : null}
              {this.state.pendingSave ? (
                <IconButton aria-label="Add to favorites">
                  <Save fontSize="small" />
                </IconButton>
              ) : null}
            </Typography>
          </CardContent>
        ) : null}
        <CardContent style={{ paddingTop: '0%', paddingBottom: '0%' }}>
          <Scheduler
            schedulerData={viewModel}
            prevClick={this.prevClick}
            nextClick={this.nextClick}
            onSelectDate={this.onSelectDate}
            onViewChange={this.onViewChange}
            eventItemClick={this.eventClicked}
            viewEventText={this.state.enableEdit ? 'Edit' : ''}
            viewEventClick={this.ops1}
            viewEvent2Text={this.state.enableEdit ? 'Delete' : ''}
            viewEvent2Click={this.ops2}
            updateEventStart={this.updateEventStart}
            updateEventEnd={this.updateEventEnd}
            moveEvent={this.moveEvent}
            newEvent={this.newEvent}
            conflictOccurred={this.conflictOccurred}
            slotClickedFunc={this.slotClickedFunc}
          />
        </CardContent>
        {this.footer()}
        <ShiftSelect
          open={open}
          showMS={showMS}
          showNS={showNS}
          onClick={this.changeTo}
          onClose={this.onCloseShiftSelect}
        />
      </Card>
    );
  }
  footer = () => {
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
        {this.state.enableEdit ? (
          <span>
            <AvChip
              color={save ? 'blue' : 'grey'}
              avatar={<Save />}
              label="Save"
              clickable={save}
              onClick={this.onSave}
            />{' '}
            <AvChip
              cAr={['red', 700, 900]}
              avatar={<Delete />}
              label="Discard"
              clickable={false}
              onClick={this.onSave}
            />
          </span>
        ) : null}

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
    this.setState({ enableEdit: !this.state.enableEdit });
  };
  onCloseShiftSelect = () => {
    this.setState({ open: false, newEvent: null });
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
    this.setState({ pendingSave: false });
  };

  //#region Scheduler functions
  prevClick = schedulerData => {
    schedulerData.prev();
    this.onScheduleChange(schedulerData);
    this.calcHolidays(schedulerData);
  };

  nextClick = schedulerData => {
    schedulerData.next();
    this.onScheduleChange(schedulerData);
    this.calcHolidays(schedulerData);
    console.log(schedulerData);
  };

  calcHolidays = () => {
    const {viewModel} = this.state;
    let { startDate, endDate, events } = viewModel;
    console.log('Start',startDate, endDate, events)
    let [start, end] = [new Date(startDate), new Date(endDate)];
    const { holidays } = this.state;
    let activeHolidays = [];
    let updateEvents = [];
    if(holidays[start.getFullYear()]!== undefined)
    holidays[start.getFullYear()].forEach(holiday => {
      if (holiday.date >= start && holiday.date <= end) {
        activeHolidays.push(holiday);
      }
    });
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
              let newCode = this.doesNeedCodeCorrection(code, holidayCodes[holiday.official].code)
              if (newCode){
                updateEvents.push({sap_id:slot.slotId,code:newCode,date:date})
                console.log('newEventUpdate')
              }
            } else {
              let newEvent = this.generateEvent(slot.slotId,moment(date).format('Y-M-D HH:mm:ss'), moment(date).format('Y-M-D 23:59:59') ,holidayCodes[holiday.official].code);
              events.push(newEvent)
              console.log('Add holiday',holiday);
            }
          }
        });
      });
      
      this.batchUpdate(updateEvents)
      console.log(events)
      viewModel.setEvents(events)
      this.setState({ events })
    }

  };

  doesNeedCodeCorrection(code,holidayCode){
    if(holidayCode === code){return false}
    else{
      if(isAny(code, ['S','NS','MS'])){
        if (holidayCode === 'OH'){
          const convertion = {MS:'MHS' ,S:'HS', NS:'NHS'}
          return convertion[code]
        }
          return code
      }
      return holidayCode
    }
  }

  onScheduleChange = schedulerData => {
    let startDate = new Date(schedulerData.startDate);
    let endDate = new Date(schedulerData.endDate);
    schedulerData.setEvents(this.state.events);
    this.setState(
      {
        viewModel: schedulerData,
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
        this.calcHolidays(schedulerData);
      }
    );
  };
  onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(this.state.events);
    this.setState(
      {
        viewModel: schedulerData
      },
      () => {
        this.calcHolidays(schedulerData);
      }
    );
  };
  onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(this.state.events);
    this.setState({ viewModel: schedulerData }, () => {
      this.calcHolidays(schedulerData);
    });
  };
  ops1 = (schedulerData, event) => {
    if (event.editable) {
      this.setState({
        currentEvent: event,
        open: true,
        pendingSave: true
      });
    }
    //alert(`You just executed ops1 to event: {id: ${event.id}, title: ${event.title}}`);
  };
  ops2 = (schedulerData, event) => {
    if (event.editable) {
      schedulerData._detachEvent(event);
      schedulerData._createRenderData();
      this.setState({
        viewModel: schedulerData,
        pendingSave: true
      });
    }
  };
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
    return {
      id: resourceId+'-'+s.valueOf() + '-' + e.valueOf(),
      title: code,
      start: start,
      end: end,
      resourceId: resourceId,
      bgColor: colors[shift_colors[code]][800],
      editable: this.isEventEditable(code,e)
    };
    
  };
  isEventEditable(code,end){
    if(code === 'NH'){
      return false
    }
    if(end <= new Date())
      console.log('Editalbe Only rules')
    return true
  }
  newEvent = (schedulerData, slotId, slotName, start, end, type, item) => {
    if (this.state.enableEdit) {
      let newEvent = this.generateEvent(slotId, start, end, 'O');
      this.setState({
        viewModel: schedulerData,
        open: true,
        newEvent: newEvent,
        pendingSave: true
      });
    }
  };
  updateEventStart = (schedulerData, event, newStart) => {
    if (this.state.enableEdit && event.editable) {
      event = this.eventRules(event, event.title, newStart, event.end);
      this.onDeleteRemaining(event, event.start, newStart);
      this.onEdit(event, newStart, event.end);
      schedulerData.updateEventStart(event, newStart);
      this.setState({
        viewModel: schedulerData,
        pendingSave: true
      });
    }
  };
  conflictOccurred = (schedulerData, action, event) => {
    //alert(`Conflict occurred. {action: ${action}, event: ${event}`);
  };
  updateEventEnd = (schedulerData, event, newEnd) => {
    if (this.state.enableEdit && event.editable) {
      event = this.eventRules(event, event.title, event.start, newEnd);
      this.onDeleteRemaining(event, newEnd, event.end, true);
      this.onEdit(event, event.start, newEnd);
      schedulerData.updateEventEnd(event, newEnd);
      this.setState({
        viewModel: schedulerData,
        pendingSave: true
      });
    }
  };
  moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
    if (this.state.enableEdit && event.editable) {
      event = this.eventRules(event, event.title, start, end);
      this.onDelete(event, event.start, event.end);
      this.onEdit(event, start, end);
      schedulerData.moveEvent(event, slotId, slotName, start, end);
      this.setState({
        viewModel: schedulerData,
        pendingSave: true
      });
    } //console.log(schedulerData.getSlots());
  };
  slotClickedFunc = (schedulerData, slot) => {
    //alert(`You just clicked a ${schedulerData.isEventPerspective ? 'task' : 'resource'}.{id: ${slot.slotId}, name: ${slot.slotName}}`);
    console.log(slot);
    console.log('slotClickedFunc', this.state.entrys);
  };
  //eventClicked = (schedulerData, event) => {alert(`You just clicked an event: {id: ${event.id}, title: ${event.title}}`);};
  
  //#endregion

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
    console.log(
      'getShifstsData',
      'wsinf/' + year + '/' + month,
      'limit will be set acording users fetch'
    );
    let path = 'wsinf/' + year + '/' + month;
    getData(path, 50, this.processShiftQuery, year, month);
  };
  /**
   * @param {number} [year]
   * @param {number} [month]
   */
  getShifstsMoreData = (year, month) => {
    let path = 'wsinf/' + year + '/' + month;
    getMoreData(path, 50, this.processShiftQuery, this.state.lastEntry, year, month);
  };
  /**
   * @param {any} snapshot
   * @param {number} year
   * @param {number} month
   * @return {Promise} emty
   */
  processShiftQuery = (snapshot, year, month) => {
    let lastVisible = snapshot.docs[snapshot.docs.length - 1];
    let { entrys, lastEntry } = this.state;

    entrys[year] = entrys[year] || {};
    entrys[year][month] = entrys[year][month] || {};

    snapshot.docs.forEach(user => {
      entrys[year][month][user.id] = entrys[year][month][user.id] || {}
      entrys[year][month][user.id]['shifts'] = user.data().m;
    });

    return new Promise(resolve => {
      this.setState(
        {
          entrys: entrys,
          lastEntry: lastVisible ? lastVisible : lastEntry
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
    let events = []
    let renderData = viewModel.renderData;
    let visubleUsers =  renderData.map(slot => {return slot.slotId})
    visubleUsers.forEach(user => {
       objectForEach(entrys, (year , months) => {
         objectForEach(months, (month,users) => {
          if(users[user] !== undefined)
            events.push(...this.groupSameAdjasentDays(user, year, month, users[user].shifts));
        })
      })
    });
    
    this.setState({ events },()=>{viewModel.setEvents(events);this.calcHolidays(viewModel);})
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
          let start = moment(new Date(year,month-1, prev !== -1 ? prev : x,0,0,0)).format('Y-M-D HH:mm:ss')
          let end = moment(new Date(year,month-1, x,23,59,59)).format('Y-M-D HH:mm:ss')
          output.push(this.generateEvent(sap_id, start, end , days[x]));
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
  onUpdate = (sap_id, code ,start, end)=>{
    let { pendingUpdate, entrys } = this.state;
    let daysBetween = moment(end).diff(moment(start), 'days');
    for (let i = 0; i <= daysBetween; i++) {
      let d = new Date(start);
      d.setDate(d.getDate() + i);
      let year = d.getFullYear();
      pendingUpdate[year] = pendingUpdate[year] || {};
      let month = d.getMonth() + 1;
      pendingUpdate[year][month] = pendingUpdate[year][month] || {};
      pendingUpdate[year][month][sap_id] = pendingUpdate[year][month][sap_id] || {}
      pendingUpdate[year][month][sap_id]['shifts'] = pendingUpdate[year][month][sap_id]['shifts'] ||{}
      pendingUpdate[year][month][sap_id]['shifts'][d.getDate()] = code;
      entrys[year][month][sap_id]['shifts'][d.getDate()] = code;
    }
    this.setState({ pendingUpdate, entrys });
  }
  batchUpdate = batch =>{
    let { pendingUpdate, entrys } = this.state;
    
    batch.forEach(({sap_id, code ,date}) =>{
      let year = date.getFullYear();
      pendingUpdate[year] = pendingUpdate[year] || {};
      let month = date.getMonth() + 1;
      pendingUpdate[year][month] = pendingUpdate[year][month] || {};
      pendingUpdate[year][month][sap_id] = pendingUpdate[year][month][sap_id] || {}
      pendingUpdate[year][month][sap_id]['shifts'] = pendingUpdate[year][month][sap_id]['shifts'] ||{}
      pendingUpdate[year][month][sap_id]['shifts'][date.getDate()] = code;
      entrys[year][month][sap_id]['shifts'][date.getDate()] = code;
    });
      
    this.setState({ pendingUpdate, entrys });
  }
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
      pendingSave: true,
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
    e.bgColor = colors[shift_colors[code]][800];
    return e;
  };
  //incomplete wip
  addHolidaysEvents = () => {
    const { holidays, users } = this.state;
    for (let idx in users) {
      console.log(users[idx]);
      for (let x in holidays) {
      }
    }
  };

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
      this.setState(
        { holidays },
        () => {
          resolve();
          this.calcHolidays();
          this.setLoading('load', false);
        }
      );
    });
  };
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
const holidayCodes ={
  O:{
    code: 'OH'
  },
  N:{
    code: 'NH'
  },
  C:{
    code: 'H'
  }
}

export default withStyles(styles)(withDragDropContext(BigCalendar));