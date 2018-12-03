import React from 'react';
import moment from 'moment';
import { withStyles } from '@material-ui/core/styles';
import BigCalendar from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import * as colors from '@material-ui/core/colors';
import { Clear, Add } from '@material-ui/icons';
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
  InputLabel
} from '@material-ui/core';
import AvChip from './avatarChip';
const localizer = BigCalendar.momentLocalizer(moment);
class HolydayPlanner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment(new Date()),
      type: 'month',
      view: 'month'
    };
    //this.emailRef = React.createRef();
  }
  bigCalendar = null;
  componentDidMount() {}
  onTypeChange = type => {
    this.setState({
      type
    });
  };
  onSelect(value) {
    console.log('select', value.format('YYYY-MM-DD'));
  }
  render() {
    let { classes } = this.props;
    let agendaD = 'Card';
    return (
      <Card style={{ minWidth: 500 }}>
        <Grid container spacing={8}>
          <Grid item xs={12}>
            <BigCalendar
              style={{ height: 500, position: 'relative', boxShadow: '0px 0px 0px' }}
              ref={ref => (this.bigCalendar = ref)}
              className={classes.card}
              localizer={localizer}
              events={event}
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
          <Grid item xs={12}>
<AvChip
              color={'blue' }
              avatar={<Add />}
              label="Add New event"
              onClick={this.onSave}
            />
          </Grid>
          <Grid item xs={12} style ={{backgroundColor: colors['grey'][200]}}>
            <form className={classes.root} autoComplete="off">
              <TextField
                id="standard-name"
                label="Name"
                type="number"
                className={classes.textField}
                value={this.state.name}
              />
              <TextField
                id="date"
                label="Date"
                type="date"
                className={classes.textField}
                InputLabelProps={{
                  shrink: true
                }}
              />
              <TextField
                id="standard-select-currency"
                select
                label="Select"
                className={classes.textField}
                value={this.state.currency}
                SelectProps={{
                  MenuProps: {
                    className: classes.menu
                  }
                }}
                helperText="Please select your currency">
                {[
                  {
                    value: true,
                    label: 'Official'
                  },
                  {
                    value: false,
                    label: 'Non - Official'
                  }
                ].map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <IconButton>
              <Add/>
              </IconButton>
            </form>
          </Grid>
        </Grid>
      </Card>
    );
  }
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
    this.setState({
      view: view
    });
  };
  onNavigate = (date, view, button) => {
    //console.log('oN',date,view,button)
    this.setState({
      date: moment(date)
    });
  };
  onRangeChange = range => {
    //console.log('RC',range)
  };
  onDrillDown = (...event) => {
    //console.log('DD',...event)
  };
  onDelete = id => () => {
    console.log('Delete ' + id);
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
}
const styles = theme => ({
  button: {
    margin: theme.spacing.unit
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
  }
});
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
export default withStyles(styles)(HolydayPlanner);
