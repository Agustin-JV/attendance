import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import {
  Tooltip,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Button,
  Select,
  MenuItem
} from '@material-ui/core';
import { CardContent, CardActions, Card ,Divider} from '@material-ui/core';
import { ReactTabulator } from 'react-tabulator';
import moment from 'moment';
import { separateCamelCase } from './utils';
class ScheduleRules extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currency: 'MXN',
      rows: [],
      tolerance: moment( new Date(0, 0, 0, 0, 6)).format('HH:mm'),
      sunday_bonus: 25,
      holiday_bonus: 50,
      week_bonus: 230,
      weekend_bonus: 230,
      night_bonus: 500,
      delay_discount: 50,
      shift_lenght: moment(new Date(0, 0, 0, 6, 49)).format('HH:mm'),
      readOnly: true
    };
    //this.onDelayChange = this.onDelayChange.bind(this)
  }
  buildRow = (id, acronym, shift, start, end, efp, ep) => {
    return { id, acronym, shift, start, end, efp, ep };
  };
  componentDidMount() {
    let rows = [
      this.buildRow(0, 'G', 'General', new Date(0, 0, 0, 8), new Date(0, 0, 0, 17), 0, 0),
      this.buildRow(0, 'S', 'Shift (Nacc)', new Date(0, 0, 0, 13), new Date(0, 0, 0, 21), 0, 230),
      this.buildRow(0, 'NS', 'Night Shift', new Date(0, 0, 0, 21), new Date(0, 0, 0, 6), 250, 250),
      this.buildRow(0, 'MS', 'Morning Shift', new Date(0, 0, 0, 6), new Date(0, 0, 0, 13), 0, 230)
    ];
    this.setState({ rows });
  }
  render() {
    const { classes } = this.props;
    const { rows, currency } = this.state;
    return (
      <Card className={classes.root}>
        <CardContent style={{textAlign: 'left'}}>
          <Typography style={{textAlign: 'center'}} variant="title">Rules</Typography>
          <Typography variant="subtitle1">Time range</Typography>
          <Divider />
          {this.timeField('shift_lenght')}
          {this.timeField('tolerance')}
          <br/><br/>
          <Typography variant="subtitle1">By Law Bonus</Typography>
          <Divider />
          {this.numberField('sunday_bonus', '%')}
          {this.numberField('holiday_bonus', '%')}
          <br/><br/>
          <Typography variant="subtitle1">Shift Bonus</Typography>
          <Divider />
          {this.numberField('week_bonus', currency)}
          {this.numberField('weekend_bonus', currency)}
          {this.numberField('night_bonus', currency)}
          <br/><br/>
          <Typography variant="subtitle1">Other</Typography>
          <Divider />
          {this.numberField('delay_discount', '%')}
           {this.currencySelect('currency')}
          <br/><br/>
           <Divider />
          <ReactTabulator
            ref={ref => (this.ref = ref)}
            columns={columns}
            data={rows}
            rowClick={this.rowClick}
          />
        </CardContent>
      </Card>
    );
  }
  onInputChange = id => event => {
    console.log(id, 'change', event);
    this.setState({
      [id]: event.target.value
    });
  };
  tooltips = () => ({
    shift_lenght:'The time a user should be inside the work area to be worthy of their bonus',
    tolerance:'The tolerance time a user have to arrive to the working area before they are no longer be worthy of their day bonus and the rest of that week bonus is decrease by '+ this.state.delay_discount+'%',
    delay_discount: 'The dicrease on the bonus pay for each delay',
    night_bonus:
      'The extra pay for compleating ' +
      moment(this.state.shift_lenght).format('H[h]:mm[m]') +
      ' inside the working area on a night shift',
    week_bonus:
      'The extra pay for compleating ' +
      moment(this.state.shift_lenght).format('H[h]:mm[m]') +
      ' inside the working area on a shift nacc form monday to friday',
    weekend_bonus:
      'The extra pay for compleating ' +
      moment(this.state.shift_lenght).format('H[h]:mm[m]') +
      ' inside the working area on a shift nacc form saturday to sunday',
    holiday_bonus: 'The extra payment by law for working on a holiday',
    sunday_bonus: 'The extra payment by law for working on a sunday'
  });
  currencySelect = (id)=>{
    const { classes } = this.props;
    const { readOnly } = this.state;
    return (
      <Tooltip title={this.tooltips()[id]}>
<TextField
select
          label={separateCamelCase(id, true)}
          value={this.state[id]}
          placeholder={0}
          type="number"
          className={classes.textFieldSmall}
          margin="normal"
          onChange={this.onInputChange(id)}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            readOnly: false,
          }}
        >
            <MenuItem value={'MXN'}>MXN</MenuItem>
            <MenuItem value={'USD'}>USD</MenuItem>
            <MenuItem value={'INR'}>INR</MenuItem>
            <MenuItem value={'EUR'}>EUR</MenuItem>
            <MenuItem value={'GBP'}>GBP</MenuItem>
            <MenuItem value={'CNY'}>CNY</MenuItem>
            <MenuItem value={'JPY'}>JPY</MenuItem>
</TextField>
          </Tooltip>
          )
  }
  numberField = (id, adorment) => {
    const { classes } = this.props;
    const { readOnly } = this.state;
    return (
      <Tooltip title={this.tooltips()[id]}>
        <TextField
          label={separateCamelCase(id, true)}
          value={this.state[id]}
          placeholder={0}
          type="number"
          className={classes.textFieldSmall}
          margin="normal"
          onChange={this.onInputChange(id)}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            readOnly: readOnly,
            endAdornment: <InputAdornment position="end">{adorment}</InputAdornment>
          }}
        />
      </Tooltip>
    );
  };
  timeField = (id) => {
    const { classes } = this.props;
    const { readOnly } = this.state;
    return (
      <Tooltip title={this.tooltips()[id]}>
         <TextField
            label={separateCamelCase(id, true)}
            type="time"
            defaultValue={this.state[id]}
            className={classes.textFieldSmall}
            margin="normal"
            onChange={this.onInputChange(id)}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              readOnly: readOnly,
              endAdornment: <InputAdornment position="end">hh:mm</InputAdornment>
            }}
          />
      </Tooltip>
    );
  };
}

const styles = theme => ({
  root: {
    display: 'flex',
    minWidth: 490
  },
  table: {
    minWidth: 470
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200
  },
  textFieldSmall: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 130
  },
  textFieldCurrency: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 120
  }
});
const getTime = value => {
  return moment(value).format('LT');
};
const columns = [
  {
    title: 'Acronyms',
    field: 'acronym',
    width: 120
  },
  {
    title: 'Shifts',
    field: 'shift',
    width: 150
  },
  {
    title: 'Start',
    field: 'start',
    width: 100,
    mutator: getTime
  },
  {
    title: 'End',
    field: 'end',
    width: 100,
    sorter: 'time',
    mutator: getTime
  }
];

export default withStyles(styles)(ScheduleRules);
