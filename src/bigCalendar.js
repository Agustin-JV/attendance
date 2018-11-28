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
import { mergeArrays, mergeArraysMultyKey } from './utils';
import { getData, getMoreData } from './fbGetPaginatedData';
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
    let resources = [
      {
        id: '00000000',
        name: 'Fulanito1',
        summary: '87877'
      },
      {
        id: 'r2',
        name: 'Resource2'
      },
      {
        id: 'r3',
        name: 'Resource3'
      },
      {
        id: 'r4',
        name: 'Resource3'
      },
      {
        id: 'r5',
        name: 'Resource5'
      }
    ];

    schedulerData.localeMoment.locale('es-mx');
    schedulerData.setResources(resources);
    //set events here or later,
    //the event array should be sorted in ascending order by event.start property, otherwise there will be some rendering errors

    schedulerData.setEvents([]);
    this.state = {
      viewModel: schedulerData,
      anchorEl: null,
      open: false,
      currentEvent: null,
      enableEdit: false,
      pendingSave: true,
      visibleUsers: [],
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
    this.toggleEdit = this.toggleEdit.bind(this);
  }
  paginationRef = null;
  // #region render
  render() {
    const { viewModel, open } = this.state;
    const { classes } = this.props;
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
        <ShiftSelect open={open} onClick={this.changeTo} onClose={this.onCloseShiftSelect} />
      </Card>
    );
  }
  footer = () => {
    return (
      <CardActions style={{ paddingTop: '0%' }} disableActionSpacing>
        <Pagination
          ref={ref => (this.paginationRef = ref)}
          rows={5}
          onPageChange={this.handleChangePage}
          onGoNext={this.onGoNext}
          onGoLast={this.onGoLast}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
        {this.state.enableEdit ? (
          <span>
            <AvChip color="blue" avatar={<Save />} label="Save" onClick={this.onSave} />{' '}
            <AvChip
              cAr={['red', 700, 900]}
              avatar={<Delete />}
              label="Discard"
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
          />
        </div>
      </CardActions>
    );
  };
  // #endregion
  onGoLast = () => {
    this.getShifts();
  };
  toggleEdit(event) {
    this.setState({ enableEdit: !this.state.enableEdit });
  }
  onCloseShiftSelect = () => {
    this.setState({ open: false });
  };
  getShifts = () => {
    let { startDate, endDate } = this.state;
    if (startDate.month === endDate.month) {
      this.getShifstsData(startDate.year, startDate.month);
    } else {
      this.getShifstsData(startDate.year, startDate.month);
      this.getShifstsData(endDate.year, endDate.month);
    }
  };
  onSave = () => {
    this.setState({ pendingSave: false });
  };

  // #region Scheduler functions
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
      let newFreshId = 0;
      schedulerData.events.forEach(item => {
        if (item.id >= newFreshId) newFreshId = item.id + 1;
      });
      console.log('update here');
      let newEvent = {
        id: newFreshId,
        title: 'X',
        start: start,
        end: end,
        resourceId: slotId,
        bgColor: 'purple',
        editable: true
      };
      schedulerData.addEvent(newEvent);
      this.setState({
        viewModel: schedulerData,
        currentEvent: newEvent,
        open: true,
        pendingSave: true
      });
    }
  };
  updateEventStart = (schedulerData, event, newStart) => {
    if (this.state.enableEdit && event.editable) {
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
      schedulerData.updateEventEnd(event, newEnd);
      this.setState({
        viewModel: schedulerData,
        pendingSave: true
      });
    }
  };
  moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
    if (this.state.enableEdit && event.editable) {
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
  // #endregion

  // #region User Server Fetch
  getUsersData = (year, month) => {
    getData('users', this.processQuery);
  };
  getUsersMoreData = () => {
    getMoreData('users', this.processQuery, this.state.lastRow);
  };
  // #endregion

  // #region Shifts Serfer Fetch & build
  getShifstsData = (year, month) => {
    getData('wsinf/' + year + '/' + month, this.processShiftQuery, year, month);
  };
  getShifstsMoreData = (year, month) => {
    getMoreData(
      'wsinf/' + year + '/' + month,
      this.processShiftQuery,
      this.state.lastRow,
      year,
      month
    );
  };
  processShiftQuery = (snapshot, year, month) => {
    let lastVisible = snapshot.docs[snapshot.docs.length - 1];
    let data = snapshot.docs.map(snapshot => {
      return this.groupSameAdjasentDays(snapshot.id, year, month, snapshot.data().m);
    });
    data = [].concat(...data);
    let { entrys, lastRow } = this.state;
    return new Promise(resolve => {
      this.setState(
        {
          entrys: mergeArraysMultyKey(data, entrys, ['resourceId', 'id']),
          lastRow: lastVisible ? lastVisible : lastRow
        },
        () => {
          this.state.viewModel.setEvents(this.state.enrtys);
          this.paginationRef.forceUpdateRows();
          resolve();
        }
      );
    });
  };
  groupSameAdjasentDays(sap_id, year, month, days) {
    let output = [];
    let prev = -1;
    for (let x = 1; x < 31; x++) {
      if (days[x] !== null && days[x + 1] !== null && days[x] === days[x + 1]) {
        if (prev === -1) prev = x;
      } else {
        output.push(this.buildShift(sap_id, year, month, prev !== -1 ? prev : x, x, days[x]));
        prev = -1;
      }
    }
    return output;
  }
  buildShift = (sap_id, year, month, day1, day2, code) => {
    return {
      id: '' + sap_id + year + month + day1 + '-' + day2,
      start: year + '-' + month + '-' + day1 + ' 00:00:00',
      end: year + ' - ' + month + ' - ' + day2 + ' 23:59:59',
      resourceId: sap_id,
      title: code,
      bgColor: colors[shiftColors[code]][800], // There most be a shift code not implemented if here is an error
      editable: true
    };
  };
  // #endregion

  getVisibleUsers = () => {};

  changeTo = code => () => {
    let e = this.state.currentEvent;
    if (e.editable) {
      e.title = code;
      console.log('implement new colors source');
      //e.bgColor = shiftColors[code].dark;
    }
    this.setState({
      currentEvent: null,
      open: false,
      pendingSave: true
    });
  };
}
let events = [
  {
    id: 1,
    start: '2017-12-17 09:30:00',
    end: '2017-12-18 23:30:00',
    resourceId: '55975',
    title: 'S',
    bgColor: '#D9D9D9',
    resizable: false,
    movable: false,
    startResizable: false,
    editable: false
  }
];
let shiftColors = { MS: 'green', S: 'lime', NS: 'purple', O: 'amber', SUS: 'cyan' };

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
export default withStyles(styles)(withDragDropContext(BigCalendar));
