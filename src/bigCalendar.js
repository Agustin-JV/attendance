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
import { mergeArrays, mergeArraysMultyKey, isAny } from './utils';
import { getData, getMoreData } from './fbGetPaginatedData';
import shift_colors from './shift_colors.json';
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
      pendingUpdate: [],
      visibleUsers: [],
      users: [],
      entrys: [],
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

  // #region render
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
    let save = this.state.pendingUpdate.length > 0;
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
  // #endregion
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
  };
  onGoLast = () => {
    this.getMoreShifts();
    this.loadHollydays();
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
  };
  nextClick = schedulerData => {
    schedulerData.next();
    this.onScheduleChange(schedulerData);
  };
  onScheduleChange = schedulerData => {
    let startDate = new Date(schedulerData.startDate);
    let endDate = new Date(schedulerData.endDate);
    schedulerData.setEvents(this.state.entrys);
    this.setState({
      viewModel: schedulerData,
      startDate: {
        year: startDate.getUTCFullYear(),
        month: startDate.getUTCMonth()
      },
      endDate: {
        year: endDate.getUTCFullYear(),
        month: endDate.getUTCMonth()
      }
    });
  };
  onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(this.state.entrys);
    this.setState({
      viewModel: schedulerData
    });
  };
  onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(this.state.entrys);
    this.setState({ viewModel: schedulerData });
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
  newEvent = (schedulerData, slotId, slotName, start, end, type, item) => {
    if (this.state.enableEdit) {
      let s = new Date(start);
      let e = new Date(end);
      let newFreshId =
        '' + slotId + s.getFullYear() + s.getMonth() + '-' + s.getDate() + '-' + e.getDate();
      schedulerData.events.forEach(item => {
        if (item.id === newFreshId) newFreshId = newFreshId + '-' + 1;
      });

      let newEvent = {
        id: newFreshId,
        title: 'X',
        start: start,
        end: end,
        resourceId: slotId,
        bgColor: 'purple',
        editable: true
      };

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
  };
  /*
    eventClicked = (schedulerData, event) => {
      alert(`You just clicked an event: {id: ${event.id}, title: ${event.title}}`);
    };
  */
  //#endregion

  //#region User Server Fetch
  /** fetchs for the users to fill the resource column */
  getUsersData = () => {
    getData('users', this.processUsersQuery);
  };
  /** continue fetching for the users from the last one to fill the resource column */
  getUsersMoreData = () => {
    getMoreData('users', this.processUsersQuery, this.state.lastRow);
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
    let path = 'wsinf/' + year + '/' + month;
    getData(path, this.processShiftQuery, year, month);
  };
  /**
   * @param {number} [year]
   * @param {number} [month]
   */
  getShifstsMoreData = (year, month) => {
    let path = 'wsinf/' + year + '/' + month;
    getMoreData(path, this.processShiftQuery, this.state.lastEntry, year, month);
  };
  /**
   * @param {any} [snapshot]
   * @param {number} [year]
   * @param {number} [month]
   * @return {Promise} emty
   */
  processShiftQuery = (snapshot, year, month) => {
    let lastVisible = snapshot.docs[snapshot.docs.length - 1];
    let data = snapshot.docs.map(snapshot => {
      return this.groupSameAdjasentDays(snapshot.id, year, month, snapshot.data().m);
    });
    data = [].concat(...data);
    let { entrys, lastEntry } = this.state;
    entrys = mergeArrays(data, entrys, 'id');
    this.state.viewModel.setEvents(entrys);

    return new Promise(resolve => {
      this.setState(
        {
          entrys: entrys,
          lastEntry: lastVisible ? lastVisible : lastEntry
        },
        () => {
          this.paginationRef.forceUpdateRows();
          resolve();
        }
      );
    });
  };
  /**
   * @param {string | number} [sap_id]
   * @param {number} [year]
   * @param {number} [month]
   * @param {Array<any>} [days]
   * @return {Array<any>} from buildShift
   */
  groupSameAdjasentDays(sap_id, year, month, days) {
    let output = [];
    let prev = -1;
    for (let x = 1; x < 31; x++) {
      if (days[x] !== null && days[x + 1] !== null && days[x] === days[x + 1]) {
        if (prev === -1) prev = x;
      } else {
        if (days[x] !== '')
          output.push(this.buildShift(sap_id, year, month, prev !== -1 ? prev : x, x, days[x]));
        prev = -1;
      }
    }
    return output;
  }
  /**
   * @param {string | number} [sap_id]
   * @param {number} [year]
   * @param {number} [month]
   * @param {number} [day1]
   * @param {number} [day1]
   * @param {String} [code]
   * @return {Object} result
   */
  buildShift = (sap_id, year, month, day1, day2, code) => {
    return {
      id: '' + sap_id + year + month + '-' + day1 + '-' + day2,
      start: year + '-' + month + '-' + day1 + ' 00:00:00',
      end: year + '-' + month + '-' + day2 + ' 23:59:59',
      resourceId: sap_id,
      title: code,
      bgColor: colors[shift_colors[code]][800], // There most be a shift code not implemented if here is an error
      editable: true
    };
  };
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
    let daysBetween = moment(end).diff(moment(start), 'days');
    let days = [];
    for (let i = 0; i <= daysBetween; i++) {
      let d = new Date(start);
      d.setDate(d.getDate() + i);
      let year = d.getFullYear();
      let month = d.getMonth() + 1;
      let day = d.getDate();
      let id = [sap_id, year, month, day];
      id = id.join('-');
      days.push({ id, sap_id, code, year, month, day });
    }
    this.setState(
      {
        pendingUpdate: mergeArrays(days, this.state.pendingUpdate, 'id')
      },
      () => {
        /*console.log(this.state.pendingUpdate)*/
      }
    );
  };
  onDelete = (event, start, end) => {
    let sap_id = event.resourceId;
    let daysBetween = moment(end).diff(moment(start), 'days');
    let days = [];
    for (let i = 0; i <= daysBetween; i++) {
      let d = new Date(start);
      d.setDate(d.getDate() + i);
      let year = d.getFullYear();
      let month = d.getMonth() + 1;
      let day = d.getDate();
      let id = [sap_id, year, month, day];
      id = id.join('-');
      days.push({ id, sap_id, code: '', year, month, day });
    }
    this.setState({
      pendingUpdate: mergeArrays(days, this.state.pendingUpdate, 'id')
    });
  };
  getVisibleUsers = (page, rowsPerPage) => {
    let { users } = this.state;
    let visibleUsers = [].concat(users).splice((page - 1) * rowsPerPage, rowsPerPage);
    this.state.viewModel.setResources(visibleUsers);
    this.setState({});
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
   * @param {object} [e] event
   * @param {string} [code] shift code
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

  loadHollydays = () => {
    console.log(this.state.viewModel.getSlots());
    for (let i in hollydays) {
    }

    /*return {
      id: '' + sap_id + year + month + '-' + day1 + '-' + day2,
      start: year + '-' + month + '-' + day1 + ' 00:00:00',
      end: year + '-' + month + '-' + day2 + ' 23:59:59',
      resourceId: sap_id,
      title: code,
      bgColor: colors[shift_colors[code]][800], // There most be a shift code not implemented if here is an error
      editable: true
    };*/
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

const hollydays = [
  {
    name: 'Año nuevo',
    year: 2018,
    day: 1,
    month: 1
  },
  {
    name: 'Dia de la Constitucion',
    year: 2018,
    day: 5,
    month: 2
  },
  {
    name: 'Natalicio de Benito Juárez',
    year: 2018,
    day: 19,
    month: 3
  },
  {
    name: 'Día del Trabajo',
    year: 2018,
    day: 1,
    month: 5
  },
  {
    name: 'Día de la Independencia',
    year: 2018,
    day: 16,
    month: 9
  },
  {
    name: 'Revolución Mexicana',
    year: 2018,
    day: 19,
    month: 11
  },
  {
    name: 'Nuevo Precidente',
    year: 2018,
    day: 1,
    month: 12
  },
  {
    name: 'Navidad',
    year: 2018,
    day: 25,
    month: 12
  }
];
export default withStyles(styles)(withDragDropContext(BigCalendar));
