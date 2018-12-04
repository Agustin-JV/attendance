//#region Imports
import React from 'react';
import moment from 'moment';
import { withStyles } from '@material-ui/core/styles';
import BigCalendar from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import * as colors from '@material-ui/core/colors';
import { Clear, Add, Forward } from '@material-ui/icons';
import {
  Fab,
  Grid,
  Typography,
  CardContent,
  CardActions,
  IconButton,
  Card,
  MenuItem,
  Button,
  FormGroup,
  Select,
  FormControl,
  TextField,
  InputLabel,
  CircularProgress
} from '@material-ui/core';
import AvChip from './avatarChip';
import { handleFile, XLSX } from './loadXlsx';
import { mergeArrays, mergeArraysMultyKey, isAny, isEmpty, arrayMatchPatterns } from './utils';
//#endregion

const localizer = BigCalendar.momentLocalizer(moment);
class HolydayPlanner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment(new Date()),
      view: 'month',
      openNewEvent: false,
      newEventName: '',
      newEventDate: '',
      newEventType: false,
      holidays: [],
      holidaysUpdate: [],
      eventHolidays: [],
      loading: false
    };
    //this.emailRef = React.createRef();
  }
  bigCalendar = null;
  componentDidMount() {}

  onToggleNewEvent = () => {
    this.setState({
      openNewEvent: !this.state.openNewEvent
    });
  };
  render() {
    const { eventHolidays, loading } = this.state;
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
              clickable = {true}
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
              {loading && <CircularProgress size={35} className={classes.fabProgress} />}
              <AvChip
                color={'blue'}
                avatar={<Forward style={{ transform: 'rotate(-90deg)' }} />}
                label="Upload file"
                loading={loading}
                clickable = {true}
              />
            </label>
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
    if(wb !== undefined ){
      var ws = wb.Sheets[wb.SheetNames[0]];
      var data = XLSX.utils.sheet_to_json(ws, {
        header: 1
      });
      this.processData(data);
    }else{
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
  onDelete = id => () => {
    console.log('Delete ' + id);
  };
  //#endregion

  buildEvents = holiday => {
    let color = holiday.official ? 'green' : 'indigo';
    let shade = holiday.official ? 400 : 300;
    let year = holiday.date.getUTCFullYear();
    let day = holiday.date.getUTCDate();
    let month = holiday.date.getUTCMonth();
    return {
      id: [year, month, day].join('-'),
      title: holiday.name,
      start: new Date(year, month, day),
      end: new Date(year, month, day, 23),
      allDay: true,
      desc: holiday.official ? 'Official' : 'Non-Official',
      official: holiday.official,
      color: colors[color][shade]
    };
  };
  onAddEvent = () => {
    const { newEventName, newEventDate, newEventType } = this.state;
    let date = newEventDate.split('-');
    let utcDate = new Date(Date.UTC(date[0], date[1] - 1, date[2]));
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

  addHoliday = holiday => {
    let { holidays, holidaysUpdate } = this.state;
    holidays = mergeArrays([holiday], holidays, 'date');
    holidaysUpdate = mergeArrays([holiday], holidaysUpdate, 'date');
    let eventHolidays = holidays.map(this.buildEvents);
    this.setState({
      holidays,
      holidaysUpdate,
      eventHolidays
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
const event = [
  {
    id: 1,
    title: 'Birthday',
    start: new Date(2018, 11, 3),
    end: new Date(2018, 11, 3, 23),
    allDay: true,
    desc: 'Official',
    official: true,
    color: colors['green'][400]
  },
  {
    id: '2as',
    title: 'Party Hour',
    start: new Date(2018, 11, 12, 12, 0, 0, 0),
    end: new Date(2018, 11, 12, 12, 30, 0, 0),
    allDay: true,
    desc: 'Most important meal of the day',
    color: colors['indigo'][300]
  }
];
const hollydays = [
  {
    name: 'Año nuevo',
    date: new Date(Date.UTC(2018, 1, 1)),
    official: true
  },
  {
    name: 'Dia de la Constitucion',
    date: new Date(Date.UTC(2018, 2, 5)),
    official: true
  },
  {
    name: 'Natalicio de Benito Juárez',
    date: new Date(Date.UTC(2018, 3, 19)),
    official: true
  },
  {
    name: 'Día del Trabajo',
    date: new Date(Date.UTC(2018, 5, 1)),
    official: true
  },
  {
    name: 'Día de la Independencia',
    date: new Date(Date.UTC(2018, 9, 16)),
    official: true
  },
  {
    name: 'Revolución Mexicana',
    date: new Date(Date.UTC(2018, 11, 19)),
    official: true
  },
  {
    name: 'Nuevo Precidente',
    date: new Date(Date.UTC(2018, 12, 1)),
    official: true
  },
  {
    name: 'Navidad',
    date: new Date(Date.UTC(2018, 12, 25)),
    official: true
  }
];
export default withStyles(styles)(HolydayPlanner);
