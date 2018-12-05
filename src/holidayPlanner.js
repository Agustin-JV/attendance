//@ts-check
//#region Imports
import React from 'react';
import moment from 'moment';
import { withStyles } from '@material-ui/core/styles';
import BigCalendar from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import * as colors from '@material-ui/core/colors';
import { Clear, Add, Forward, Save } from '@material-ui/icons';
import { Grid, IconButton, Card, MenuItem, CircularProgress, TextField } from '@material-ui/core';
import AvChip from './avatarChip';
import { handleFile, XLSX } from './loadXlsx';
import { db } from './fire_init';
import { mergeArrays, isAny, isEmpty, arrayMatchPatterns } from './utils';
import { getDocument } from './fbGetPaginatedData';
//#endregion

//#region TS annotations
/**
 * @typedef   {Object}          HollydayEvent
 * @property  {string | number} id
 * @property  {string}          title
 * @property  {Date}            start
 * @property  {Date}            end
 * @property  {boolean}         allDay
 * @property  {string}          desc
 * @property  {boolean}         official
 * @property  {string}          color
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

/**
 * @typedef  {Object}           State
 * @property {moment}           date
 * @property {string}           view
 * @property {boolean}          openNewEvent
 * @property {string}           newEventName
 * @property {string}           newEventDate
 * @property {boolean}          newEventType
 * @property {HolidayObjectArr} holidays
 * @property {number[]}         pendingUpdate
 * @property {HollydayEvent[]}  eventHolidays
 * @property {boolean}          loading
 */
//#endregion

const localizer = BigCalendar.momentLocalizer(moment);
class HolydayPlanner extends React.Component {
  constructor(props) {
    super(props);

    /** @type {State} */
    this.state = {
      date: moment(new Date()),
      view: 'month',
      openNewEvent: false,
      newEventName: '',
      newEventDate: '',
      newEventType: false,
      holidays: {},
      pendingUpdate: [],
      eventHolidays: [],
      loading: false,
      loadingSave: false,
      lastEntry:null
    };
    //this.emailRef = React.createRef();
  }
  bigCalendar = null;
  componentDidMount() {
    this.getShifstsData((new Date()).getFullYear())
  }

  onToggleNewEvent = () => {
    this.setState({
      openNewEvent: !this.state.openNewEvent
    });
  };
  render() {
    const { eventHolidays, loading,loadingSave } = this.state;
    let { classes } = this.props;
    return (
      <Card style={{ minWidth: 500 }}>
        <Grid container spacing={8}>
          <Grid item xs={12}>
            <BigCalendar
              style={{
                height: 500,
                paddingBottom: 0,
                position: 'relative',
                boxShadow: '0px 0px 0px'
              }}
              ref={ref => (this.bigCalendar = ref)}
              className={classes.card}
              localizer={localizer}
              events={eventHolidays}
              startAccessor="start"
              endAccessor="end"
              views={['month', 'agenda']}
              length={365}
              date={this.getViewDate(this.state.view)}
              toolbar={true}
              onRangeChange={this.onRangeChange}
              onDrillDown={this.onDrillDown}
              onNavigate={this.onNavigate}
              onView={this.onView}
              eventPropGetter={event => ({
                style: {
                  backgroundColor: event.color
                }
              })}
              components={{
                event: this.Event,
                agenda: {
                  length: 365,
                  event: this.EventAgenda
                }
              }}
            />
          </Grid>
          <Grid item xs={12} style={{ paddingBottom: '10px' }}>
            <AvChip
              color={'blue'}
              avatar={<Add />}
              label="Add New event"
              onClick={this.onToggleNewEvent}
              clickable={true}
            />{' '}
            <input
              accept=".xlsx"
              className={classes.input}
              id="contained-button-file"
              multiple
              type="file"
              onChange={this.loadFile}
            />
            <label htmlFor="contained-button-file">
              <AvChip
                color={'blue'}
                avatar={<Forward style={{ transform: 'rotate(-90deg)' }} />}
                label="Upload file"
                loading={loading}
                clickable={true}
              />
            </label>{' '}
            <AvChip
              color={'blue'}
              avatar={<Save />}
              label="Save"
              onClick={this.saveHolydays}
              loading={loadingSave}
              clickable={this.state.pendingUpdate.length>0}
            />
          </Grid>
          {this.state.openNewEvent ? (
            <Grid
              item
              xs={12}
              style={{ paddingBottom: '20px', backgroundColor: colors['grey'][200] }}>
              <TextField
                id="holiday-name"
                label="Holiday name"
                type="text"
                className={classes.textField}
                value={this.state.newEventName}
                onChange={this.onInputChange('newEventName')}
              />
              <TextField
                id="holiday-date"
                label="Date"
                type="date"
                className={classes.textField}
                onChange={this.onInputChange('newEventDate')}
                InputLabelProps={{
                  shrink: true
                }}
              />
              <TextField
                id="select-holidayType"
                select
                label="Select"
                className={classes.textField}
                value={this.state.newEventType}
                onChange={this.onInputChange('newEventType')}
                SelectProps={{
                  MenuProps: {
                    className: classes.menu
                  }
                }}>
                {eventType.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <IconButton onClick={this.onAddEvent}>
                <Add />
              </IconButton>
            </Grid>
          ) : null}
        </Grid>
      </Card>
    );
  }
  loadFile = e => {
    this.setState({
      loading: true
    });
    handleFile(this.fileCallback)(e);
  };
  fileCallback = wb => {
    if (wb !== undefined) {
      var ws = wb.Sheets[wb.SheetNames[0]];
      var data = XLSX.utils.sheet_to_json(ws, {
        header: 1
      });
      this.processData(data);
    } else {
      this.setState({
        loading: false
      });
    }
  };
  processData = data => {
    for (let x in data) {
      if (!isEmpty(data[x])) {
        let matchPattern = arrayMatchPatterns(data[x], [
          ['string', 'any', 'number', 'number', 'number']
        ]);
        if (matchPattern) {
          let utcDate = new Date(Date.UTC(data[x][2], data[x][3] - 1, data[x][4]));
          let official = false;
          if (typeof data[x][1] === 'string') {
            let o = data[x][1].toLowerCase();
            official = isAny(o, ['true', 'si', 'x', 'yes']);
          } else if (typeof data[x][1] === 'boolean') {
            official = data[x][1];
          }
          this.addHoliday({
            name: data[x][0],
            date: utcDate,
            official: official
          });
        }
      }
    }
    this.setState({
      loading: false
    });
  };
  onInputChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  //#region Calendar funcs
  Event({ event }) {
    return (
      <span style={{ color: 'white' }}>
        <strong>{event.title}</strong>
        {event.desc && ':  ' + event.desc}
      </span>
    );
  }
  getViewDate = view => {
    if ('agenda' === view) {
      return this.state.date.startOf('year').toDate();
    } else {
      return this.state.date.toDate();
    }
  };
  onView = view => {
    this.setState({ view });
  };
  onNavigate = (date, view, button) => {
    this.setState({ date: moment(date) });
  };
  onRangeChange = range => {
    //console.log('RC',range)
  };
  onDrillDown = (...event) => {
    //console.log('DD',...event)
  };
  EventAgenda = ({ event }) => {
    let onDelete = this.onDelete(event.id);
    return (
      <Grid container spacing={8}>
        <Grid item xs={9}>
          <span>
            <b>{event.title}</b>
            {event.desc && <p>{event.desc}</p>}
          </span>
        </Grid>
        <Grid item xs={3}>
          <IconButton color="default" onClick={onDelete} aria-label="Add">
            <Clear />
          </IconButton>
        </Grid>
      </Grid>
    );
  };
  /**
   * @param {string} id its the date of the event
   * using the id calls deleteHoliday 
   */
  onDelete = id => () => {
    console.log(id)
    this.deleteHoliday(this.getUTCDateFromString(id))
  };
  //#endregion

  /**
   * @param {HolidayObject} holiday 
   * @return {HollydayEvent} holiday event
   */
  buildEvents = holiday => {
    let color = holiday.official ? 'green' : 'indigo';
    let shade = holiday.official ? 400 : 300;
    let year = holiday.date.getUTCFullYear();
    let day = holiday.date.getUTCDate();
    let month = holiday.date.getUTCMonth();
    return {
      id: [year, month+1, day].join('-'),
      title: holiday.name,
      start: new Date(year, month, day),
      end: new Date(year, month, day, 23),
      allDay: true,
      desc: holiday.official ? 'Official' : 'Non-Official',
      official: holiday.official,
      color: colors[color][shade]
    };
  };
  /**@param {Date} date */
  deleteHoliday = date => {
    let { holidays, pendingUpdate } = this.state;
    let year = date.getUTCFullYear();
    let idx = holidays[year].findIndex(obj =>{ return obj.date.getTime() === date.getTime()})
    holidays[year].splice(idx,1)
    pendingUpdate = mergeArrays([year], pendingUpdate );
    
    this.setState({
      holidays,
      pendingUpdate
    },()=>{this.buildEventHolidays();});
  }

  buildEventHolidays = () => {
    let { holidays } = this.state;
    let eventHolidays = []
    for(let year in holidays){
      eventHolidays = eventHolidays.concat(holidays[year].map(this.buildEvents));
    }
    this.setState({ eventHolidays });
  }
  /**
   * @param {string} date 
   * @example 'yyyy-mm-dd'
   * @example '2018-12-31'
   * @return {Date} UTC Date
   */
  getUTCDateFromString = date => {
    let d = date.split('-');
    return new Date(Date.UTC(d[0], d[1] - 1, d[2]));
  }
  onAddEvent = () => {
    const { newEventName, newEventDate, newEventType } = this.state;
    let utcDate = this.getUTCDateFromString(newEventDate)
    console.log(utcDate);
    this.addHoliday({
      name: newEventName,
      date: utcDate,
      official: newEventType
    });
    this.setState({
      newEventName: '',
      newEventDate: '',
      newEventType: false,
      openNewEvent: false
    });
  };
  /**@param {HolidayObject} holiday */
  addHoliday = holiday => {
    let { holidays, pendingUpdate } = this.state;
    let year = holiday.date.getUTCFullYear();

    holidays[year] = mergeArrays([holiday], holidays[year]||[], 'date');
    pendingUpdate = mergeArrays([holiday.date.getUTCFullYear()], pendingUpdate, );
    
    this.setState({
      holidays,
      pendingUpdate
    },()=>{this.buildEventHolidays();});
  };
  /**
   * Sends to Firebase the changes on the events
   * made on the editor or by uploading a file
   * if there is any **pendingUpdate** on the sate
   */
  saveHolydays = () => {
    const { pendingUpdate, holidays } = this.state;

    if (pendingUpdate && pendingUpdate.length > 0) {
    this.setState({ pendingUpdate: [] ,loadingSave:true});
      // Get a new write batch
      
      var batch = db.batch();

      pendingUpdate.forEach(year => {
        var holidaysRef = db.collection('holidays').doc(year.toString());
        batch.set(holidaysRef, {h:holidays[year]});
      });

      // Commit the batch
      batch.commit().then(this.saveSuccess);
    }
  };
  saveSuccess=()=>{
    this.setState({loadingSave:false});
    //console.log('succesfull save');
  }
  /**
   * @param {number} year
   */
  getShifstsData = (year) => {
    getDocument('holidays',year.toString(), this.processHolidaysQuery, year);
  };
 
  /**
   * @param {any} snapshot
   * @param {number} year
   * @return {Promise} emty
   */
  processHolidaysQuery = (document, year) => {

    let data = document.data().h.map(holiday => {
      return  { date: holiday.date.toDate(), name:holiday.name, official: holiday.official}
    });
    let { holidays } = this.state;

    holidays[year] = data

    return new Promise(resolve => {
      this.setState(
        {
          holidays: holidays,
        },
        () => {
          this.buildEventHolidays();
          resolve();
        }
      );
    });
  };
}
const styles = theme => ({
  button: {
    margin: theme.spacing.unit
  },
  menu: {
    width: 200
  },
  card: {
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
    width: 'auto'
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200
  },
  input: {
    display: 'none'
  },
  fabProgress: {
    color: colors['green'][500],
    position: 'absolute',
    top: 10,
    left: -120,
    zIndex: 1
  }
});
const eventType = [
  {
    value: true,
    label: 'Official'
  },
  {
    value: false,
    label: 'Non - Official'
  }
];
export default withStyles(styles)(HolydayPlanner);
