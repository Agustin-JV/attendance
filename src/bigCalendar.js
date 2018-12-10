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
import { mergeArrays, mergeArraysMultyKey, isAny, objectMap, objectForEach } from './utils';
import { getData, getMoreData, getDocument } from './fbGetPaginatedData';
import shift_colors from './shift_colors.json';
import { db } from './fire_init';
//#endregion
//#region TS annotations
/**
 * @typedef  {Object}           State
 * @property {Object}           viewModel
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
class BigCalendar extends Component {
  constructor(props) {
    super(props);
    let schedulerData = new SchedulerData(
      moment().format(DATE_FORMAT),
      ViewTypes.Week,
      false,
      false,
      {
        dayMaxEvents: 1,
        crossResourceMove: false,
        checkConflict: true,
        resourceName: 'User Name',
        taskName: 'Shift',
        agendaViewHeader: 'Agenda',
        addMorePopoverHeaderFormat: 'MMM D, YYYY dddd',
        eventItemPopoverDateFormat: 'MMM D',
        nonAgendaDayCellHeaderFormat: 'ha',
        nonAgendaOtherCellHeaderFormat: 'ddd D',
        movable: this.props.editable,
        resizable: this.props.editable,
        creatable: this.props.editable,
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
      currentEvent: null,
      newEvent: null,
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

  //#region render
  render() {
    const { viewModel } = this.state;
    return (
          <Scheduler
            schedulerData={viewModel}
            prevClick={this.prevClick}
            nextClick={this.nextClick}
            onSelectDate={this.onSelectDate}
            onViewChange={this.onViewChange}
            eventItemClick={this.eventClicked}
            viewEventText={this.props.editable ? 'Edit' : ''}
            viewEventClick={this.ops1}
            viewEvent2Text={this.props.editable ? 'Delete' : ''}
            viewEvent2Click={this.ops2}
            updateEventStart={this.updateEventStart}
            updateEventEnd={this.updateEventEnd}
            newEvent={this.newEvent}
            conflictOccurred={this.conflictOccurred}
            slotClickedFunc={this.slotClickedFunc}
          />
    );
  }
  
  //#endregion

  //#region Scheduler functions
  prevClick = schedulerData => {
    schedulerData.prev();
    this.onScheduleChange(schedulerData);
  };
  componentDidMount(){
    this.props.setViewModel(this.state.viewModel);
  }
  nextClick = schedulerData => {
    schedulerData.next();
    this.onScheduleChange(schedulerData);
  };

  onScheduleChange = schedulerData => {
    let startDate = new Date(schedulerData.startDate);
    let endDate = new Date(schedulerData.endDate);
    schedulerData.setEvents(this.props.events);
    this.setState(
      { viewModel: schedulerData },
      () => {
        this.props.setViewModel(schedulerData);
        this.props.setDateRange(startDate,endDate);
        this.props.calcHolidays(schedulerData);
      }
    );
  };
  onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(this.props.events);
    this.setState(
      {
        viewModel: schedulerData
      },
      () => {
        this.props.setViewModel(schedulerData);
        this.props.calcHolidays(schedulerData);
      }
    );
  };
  onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    schedulerData.setEvents(this.props.events);
    this.setState({ viewModel: schedulerData }, () => {
      this.props.setViewModel(schedulerData);
      this.props.calcHolidays(schedulerData);
    });
  };
  /**
   * If editable will evaluate if the event is on a holiday
   * if it is it will set the shifle select propertyes acordingly
   */
  ops1 = (schedulerData, event) => {
    this.props.onEditEvent();
  };
  /**
   * If editable will evaluate if the event is on a holiday
   * if it is it will roll back to the holyday
   */
  ops2 = (schedulerData, event) => {
    this.porops.onDeleteEvent(event)
  };

  newEvent = (schedulerData, slotId, slotName, start, end, type, item) => {
    this.props.onNewEvent(slotId,start,end);
  };
  
  updateEventStart = (schedulerData, event, newStart) => {
    if (this.state.enableEdit && event.editable)
      this.props.onUdateStart(event, newStart)
  };
  conflictOccurred = (schedulerData, action, event) => {
    //alert(`Conflict occurred. {action: ${action}, event: ${event}`);
  };
  updateEventEnd = (schedulerData, event, newEnd) => {
    if (this.state.enableEdit && event.editable) 
      this.props.onUpdateEnd(event, newEnd)
  };

  slotClickedFunc = (schedulerData, slot) => {
    console.log(slot);
  };
  //eventClicked = (schedulerData, event) => {alert(`You just clicked an event: {id: ${event.id}, title: ${event.title}}`);};

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

export default withStyles(styles)(withDragDropContext(BigCalendar));
