//@ts-check

//#region IMPORTS
import React, { Component } from 'react';
import './react-big-scheduler/css/style.css';
import Scheduler, {
  SchedulerData,
  ViewTypes,
  DATE_FORMAT
} from './react-big-scheduler';
import moment from 'moment';
import withDragDropContext from './withDnDContext';

//#endregion
//#region TS annotations
/**
 * @typedef  {Object}           State
 * @property {Object}           viewModel
 * @property {Array}          visibleUsers
 * @property {Array}           users
 * @property {Oject}           entrys
 * @property {Object}          currentEvent
 */
/**
 * @typedef   {Object}  HolidayObject
 * @property  {string}  name
 * @property  {Date}    date
 * @property  {String} official 'O':Official Holdiay OH, 'N':None Workable NH, 'C' Commemorative Holiday H.
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
        movable: false,
        endResizable: false,
        startResizable: false,
        creatable: false,
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
  scheduler = null;
  //#region render
  render() {
    const { viewModel } = this.state;

    return (
      <Scheduler
        ref={ref => (this.scheduler = ref)}
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
  updateSchedulerSetings = () => {
    //let viewModel = setSchedulerData(this.props);
    //this.setState({viewModel})
    let { viewModel } = this.state;
    let { editable } = this.props;
    console.log('updateSchedulerSetings', this.scheduler, viewModel, editable);
    viewModel.config.endResizable = !editable;
    viewModel.config.startResizable = !editable;
    viewModel.config.creatable = !editable;
    this.setState({ viewModel });
  };

  prevClick = schedulerData => {
    schedulerData.prev();
    this.onScheduleChange(schedulerData);
  };
  componentDidMount() {
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
    this.setState({ viewModel: schedulerData }, () => {
      this.props.setViewModel(schedulerData);
      this.props.setDateRange(startDate, endDate);
      //this.props.calcHolidays(schedulerData);
    });
  };
  onViewChange = (schedulerData, view) => {
    schedulerData.setViewType(
      view.viewType,
      view.showAgenda,
      view.isEventPerspective
    );
    this.onScheduleChange(schedulerData);
  };
  onSelectDate = (schedulerData, date) => {
    schedulerData.setDate(date);
    this.onScheduleChange(schedulerData);
  };
  /**
   * If editable will evaluate if the event is on a holiday
   * if it is it will set the shifle select propertyes acordingly
   */
  ops1 = (schedulerData, event) => {
    this.props.onEditEvent(event);
  };
  /**
   * If editable will evaluate if the event is on a holiday
   * if it is it will roll back to the holyday
   */
  ops2 = (schedulerData, event) => {
    this.props.onDeleteEvent(event);
  };

  newEvent = (schedulerData, slotId, slotName, start, end, type, item) => {
    this.props.onNewEvent(slotId, start, end);
  };

  updateEventStart = async (schedulerData, event, newStart) => {
    if (event.editable) {
      event = await this.props.onUdateStart(event, newStart);
      schedulerData.updateEventStart(event, newStart);
      this.setState({ viewModel: schedulerData });
    }
  };
  conflictOccurred = (schedulerData, action, event) => {
    //alert(`Conflict occurred. {action: ${action}, event: ${event}`);
  };
  updateEventEnd = async (schedulerData, event, newEnd) => {
    if (event.editable) {
      event = await this.props.onUpdateEnd(event, newEnd);
      schedulerData.updateEventEnd(event, newEnd);
      this.setState({ viewModel: schedulerData });
    }
  };

  slotClickedFunc = (schedulerData, slot) => {
    console.log(slot);
  };
  //eventClicked = (schedulerData, event) => {alert(`You just clicked an event: {id: ${event.id}, title: ${event.title}}`);};

  //#endregion
}

export default withDragDropContext(BigCalendar);
