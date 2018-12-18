import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { Tooltip, TextField, Typography, InputAdornment, MenuItem } from '@material-ui/core';
import { ExpansionPanel, ExpansionPanelSummary, CircularProgress } from '@material-ui/core';
import { Save, Edit, ExpandMore } from '@material-ui/icons';
import { CardHeader, CardActions, Card, Divider } from '@material-ui/core';
import moment from 'moment';
import { separateCamelCase } from './utils';
import AvChip from './avatarChip';
import { db } from './fire_init';
import { getDocument } from './fbGetPaginatedData';
class ScheduleRules extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currency: 'MXN',
      tolerance: '00:00',
      sunday_bonus: 0,
      holiday_bonus: 0,
      week_bonus: 0,
      weekend_bonus: 0,
      night_bonus: 0,
      delay_discount: 0,
      shift_lenght: '00:00',
      readOnly: true,
      edit: false,
      pendingUpdate: false,
      loading: { load: false, upload: false, save: false }
    };
  }
  componentDidMount() {
    this.setLoading('load', true);
    getDocument('settings', 'schedule', this.processScheduleSettingsQuery);
  }
  /**
   * @param {any} snapshot
   * @return {Promise} emty
   */
  processScheduleSettingsQuery = document => {
    let {
      currency,
      tolerance,
      sunday_bonus,
      holiday_bonus,
      week_bonus,
      weekend_bonus,
      night_bonus,
      delay_discount,
      shift_lenght
    } = document.data();

    return new Promise(resolve => {
      this.setState(
        {
          currency,
          tolerance,
          sunday_bonus,
          holiday_bonus,
          week_bonus,
          weekend_bonus,
          night_bonus,
          delay_discount,
          shift_lenght
        },
        () => {
          this.setLoading('load', false);
          resolve();
        }
      );
    });
  };
  render() {
    const { classes } = this.props;
    const { currency, loading, readOnly, pendingUpdate } = this.state;
    return (
      <Card className={classes.root}>
        <CardHeader title="Rules" style={{ backgroundColor: '#fff' }} />
        {loading['load'] ? (
          <div style={{ position: 'relative' }}>
            <CircularProgress />
          </div>
        ) : (
          <div>
            <form id="schedule-rules-form" onSubmit={this.save}>
              <ExpansionBlock title="Time Range">
                {this.timeField('shift_lenght')}
                {this.timeField('tolerance')}
              </ExpansionBlock>
              <ExpansionBlock title="By Law Bonus">
                {this.numberField('sunday_bonus', '%')}
                {this.numberField('holiday_bonus', '%', '+')}
              </ExpansionBlock>
              <ExpansionBlock title="Shift Bonus">
                {this.numberField('week_bonus', currency)}
                {this.numberField('weekend_bonus', currency)}
                {this.numberField('night_bonus', currency)}
              </ExpansionBlock>
              <ExpansionBlock title="Other">
                {this.numberField('delay_discount', '%', null, 100)}
                {this.currencySelect('currency')}
              </ExpansionBlock>
              <input style={{ display: 'none' }} id="contained-button-submit" type="submit" />
            </form>
            <CardActions className={classes.actions}>
              <span>
                <AvChip
                  cAr={!readOnly ? ['indigo', 400, 700] : ['grey', 500, 700]}
                  theme={!readOnly ? 'white' : 'black'}
                  avatar={<Edit />}
                  variant={!readOnly ? 'default' : 'outlined'}
                  label={!readOnly ? 'Diavtivate Edit' : 'Enable Edit'}
                  onClick={this.edit}
                  clickable={true}
                />{' '}
                <label htmlFor="contained-button-submit">
                  <AvChip
                    cAr={pendingUpdate ? ['indigo', 400, 700] : ['grey', 500, 700]}
                    avatar={<Save />}
                    label="Save"
                    loading={loading['save']}
                    variant={pendingUpdate ? 'default' : 'outlined'}
                    hide={readOnly}
                    disabled={pendingUpdate}
                    clickable={pendingUpdate}
                  />
                </label>
              </span>
            </CardActions>
          </div>
        )}
      </Card>
    );
  }
  setLoading(key, value) {
    let { loading } = this.state;
    loading[key] = value;
    this.setState({ loading });
  }
  save = event => {
    event.preventDefault();
    console.log('Save some data');
    let {
      currency,
      tolerance,
      sunday_bonus,
      holiday_bonus,
      week_bonus,
      weekend_bonus,
      night_bonus,
      delay_discount,
      shift_lenght
    } = this.state;
    this.setLoading('save', true);
    this.setState({ pendingUpdate: false });
    db.collection('settings')
      .doc('schedule')
      .set({
        currency,
        tolerance,
        sunday_bonus,
        holiday_bonus,
        week_bonus,
        weekend_bonus,
        night_bonus,
        delay_discount,
        shift_lenght
      })
      .then(this.setLoading('save', false))
      .catch(this.dintSave);
  };
  dintSave = error => {
    alert('There was an error while trying to save, please try again in a few seconds');
    console.error('Error writing document: ', error);
    let { loading } = this.state;
    loading['save'] = false;
    this.setState({ pendingUpdate: true, loading });
  };

  edit = () => {
    this.setState({ readOnly: !this.state.readOnly });
  };
  onInputChange = id => event => {
    this.setState({
      [id]: event.target.value,
      pendingUpdate: true
    });
  };
  tooltips = () => ({
    shift_lenght: 'The time a user should be inside the work area to be worthy of their bonus',
    tolerance:
      'The tolerance time a user have to arrive to the working area before they are no longer be worthy of their day bonus and the rest of that week bonus is decrease by ' +
      this.state.delay_discount +
      '%',
    delay_discount: 'The dicrease on the bonus pay for each delay cant excede 100%',
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
    sunday_bonus: 'The extra payment by law for working on a sunday',
    currency: 'The currency on which the payment will be done'
  });
  currencySelect = id => {
    const { classes } = this.props;
    const { readOnly } = this.state;
    return (
      <Tooltip title={this.tooltips()[id]}>
        <TextField
          select
          label={separateCamelCase(id, true)}
          value={this.state[id]}
          type="number"
          required={true}
          className={classes.textFieldSmall}
          margin="normal"
          onChange={this.onInputChange(id)}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            readOnly: readOnly,
            inputProps: {
              form: 'schedule-rules-form'
            }
          }}>
          <MenuItem value={'MXN'}>MXN</MenuItem>
          <MenuItem value={'USD'}>USD</MenuItem>
          <MenuItem value={'INR'}>INR</MenuItem>
          <MenuItem value={'EUR'}>EUR</MenuItem>
          <MenuItem value={'GBP'}>GBP</MenuItem>
          <MenuItem value={'CNY'}>CNY</MenuItem>
          <MenuItem value={'JPY'}>JPY</MenuItem>
        </TextField>
      </Tooltip>
    );
  };
  numberField = (id, adorment, startAdornment, max = 9999999999) => {
    const { classes } = this.props;
    const { readOnly } = this.state;
    return (
      <Tooltip title={this.tooltips()[id]}>
        <TextField
          label={separateCamelCase(id, true)}
          value={this.state[id]}
          placeholder={'0'}
          type="number"
          className={classes.textFieldSmall}
          margin="normal"
          onChange={this.onInputChange(id)}
          InputLabelProps={{ shrink: true }}
          required
          InputProps={{
            readOnly: readOnly,
            startAdornment: startAdornment ? (
              <InputAdornment position="start">{startAdornment}</InputAdornment>
            ) : null,
            endAdornment: <InputAdornment position="end">{adorment}</InputAdornment>,
            inputProps: {
              form: 'schedule-rules-form',
              required: true,
              min: 0,
              max: max
            }
          }}
        />
      </Tooltip>
    );
  };
  timeField = id => {
    const { classes } = this.props;
    const { readOnly } = this.state;
    return (
      <Tooltip title={this.tooltips()[id]}>
        <TextField
          label={separateCamelCase(id, true)}
          type="time"
          required={true}
          value={this.state[id]}
          className={classes.textFieldSmall}
          margin="normal"
          onChange={this.onInputChange(id)}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            readOnly: readOnly,
            endAdornment: <InputAdornment position="end">hh:mm</InputAdornment>,
            inputProps: {
              form: 'schedule-rules-form'
            }
          }}
        />
      </Tooltip>
    );
  };
}

const ExpansionBlock = props => (
  <ExpansionPanel style={{ backgroundColor: '#fff' }}>
    <ExpansionPanelSummary expandIcon={<ExpandMore />}>
      <Typography variant="subtitle1">{props.title}</Typography>
    </ExpansionPanelSummary>
    <Divider />
    {props.children}
  </ExpansionPanel>
);

const styles = theme => ({
  root: {
    width: 530,
    align:'center',
    backgroundColor: '#eee',
    margin: '0 auto',
    direction:'ltr',
    display: 'flex',
    flexDirection: 'column'
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
  },
  actions: {
    display: 'flex',
    backgroundColor: '#fff'
  }
});

export default withStyles(styles)(ScheduleRules);
