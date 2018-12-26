import React from 'react';
import Button from '@material-ui/core/Button';
import { Close, Save } from '@material-ui/icons';
import {
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  Modal,
  Typography,
  TextField,
  Tooltip,
  Paper,
  Divider,
  InputAdornment,
  Slide
} from '@material-ui/core';
import ExpansionBlock from './expansionBlock';
import { withStyles } from '@material-ui/core/styles';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { separateCamelCase } from './utils';
import { getDocument } from './fbGetPaginatedData';
import { db } from './fire_init';
//const BrowserHistory = require('react-router-dom/lib/BrowserHistory').default;
class EditUserForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      email: '',
      loading: { load: false, upload: false, save: false }
    };
  }
  setLoading(key, value) {
    let { loading } = this.state;
    loading[key] = value;
    this.setState({ loading });
  }
  componentDidMount() {
    console.log(this.props.match.params.id);
    this.setLoading('load', true);
    getDocument('settings', 'schedule', this.processScheduleSettingsQuery);
  }
  /**
   * Loads the app references shift times and stores them with the default_ prefix
   * @param {any} document
   * @return {Promise} emty
   */
  processScheduleSettingsQuery = document => {
    let {
      night_start,
      night_end,
      normal_start,
      normal_end,
      morning_start,
      morning_end
    } = document.data();

    return new Promise(resolve => {
      this.setState(
        {
          night_start,
          night_end,
          normal_start,
          normal_end,
          morning_start,
          morning_end,
          default_night_start: night_start,
          default_night_end: night_end,
          default_normal_start: normal_start,
          default_normal_end: normal_end,
          default_morning_start: morning_start,
          default_morning_end: morning_end,
          open: true
        },
        () => {
          if (this.props.match.params.id !== 'new')
            getDocument('users', this.props.match.params.id, this.processUserQuery);
          else this.displayShiftSettingsStatus();
          resolve();
        }
      );
    });
  };

  /**
   * Load user data
   * @param {any} document
   * @return {Promise} emty
   */
  processUserQuery = document => {
    let {
      sap_id,
      name,
      rm_sap_id,
      badge,
      client,
      project,
      project_code,
      email,
      night_start,
      night_end,
      normal_start,
      normal_end,
      morning_start,
      morning_end
    } = document.data();
    let {
      default_night_start,
      default_night_end,
      default_normal_start,
      default_normal_end,
      default_morning_start,
      default_morning_end
    } = this.state;
    return new Promise(resolve => {
      this.setState(
        {
          sap_id,
          name,
          rm_sap_id,
          badge,
          client,
          project,
          project_code,
          email,
          night_start: night_start ? night_start : default_night_start,
          night_end: night_end ? night_end : default_night_end,
          normal_start: normal_start ? normal_start : default_normal_start,
          normal_end: normal_end ? normal_end : default_normal_end,
          morning_start: morning_start ? morning_start : default_morning_start,
          morning_end: morning_end ? morning_end : default_morning_end
        },
        () => {
          this.setLoading('load', false);
          this.displayShiftSettingsStatus();

          resolve();
        }
      );
    });
  };
  displayShiftSettingsStatus = (id, value) => {
    let [default_morning, default_normal, default_night] = [
      this.timeIsDefault('morning_end', id, value) &&
        this.timeIsDefault('morning_start', id, value),
      this.timeIsDefault('noraml_end', id, value) && this.timeIsDefault('normal_start', id, value),
      this.timeIsDefault('night_end', id, value) && this.timeIsDefault('night_start', id, value)
    ];
    this.setState({
      default_night,
      default_normal,
      default_morning
    });
  };
  /** target and value are needed to update make the calck with the new
   * value becasue set state from the previous step is not allready done */
  timeIsDefault = (id, target, value) => {
    if (id === target) {
      return value === this.state['default_' + id];
    }
    return this.state[id] === this.state['default_' + id];
  };
  handleClose = () => {
    this.setState({ open: false });
    setTimeout(this.props.history.goBack, 250);
  };
  onSubmit = event => {
    event.preventDefault();
    let {
      sap_id,
      name,
      rm_sap_id,
      badge,
      client,
      project,
      project_code,
      email,
      night_start,
      night_end,
      normal_start,
      normal_end,
      morning_start,
      morning_end
    } = this.state;

    this.props.newRow({
      sap_id,
      name,
      rm_sap_id,
      badge,
      client,
      project,
      project_code,
      email,
      night_start,
      night_end,
      normal_start,
      normal_end,
      morning_start,
      morning_end
    });
  };
  onInputChange = id => event => {
    let value = event.target.value;
    this.setState(
      {
        [id]: value,
        pendingUpdate: true
      },
      this.displayShiftSettingsStatus(id, value)
    );
  };
  resetShift = id => () => {
    this.setState({
      [id + '_start']: this.state['default_' + id + '_start'],
      [id + '_end']: this.state['default_' + id + '_end'],
      ['default_' + id]: true
    });
  };

  render() {
    const { classes } = this.props;
    const { default_night, default_normal, default_morning } = this.state;
    return (
      <Dialog
        fullScreen
        open={this.state.open}
        onClose={this.handleClose}
        TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton color="inherit" onClick={this.handleClose} aria-label="Close">
              <Close />
            </IconButton>
            <Typography variant="h6" color="inherit" className={classes.flex}>
              {this.props.match.params.id === 'new'
                ? 'Edit New User'
                : 'Edit User ' + this.props.match.params.id}
            </Typography>
            <IconButton color="inherit" type="submit" form="edit-user-form" aria-label="Save">
              <Save />
            </IconButton>
          </Toolbar>
        </AppBar>
        <ValidatorForm
          className={classes.container}
          id="edit-user-form"
          autoComplete="off"
          onSubmit={this.save}>
          <ExpansionBlock title="Acount Details">
            {this.composeField('email', 'email', false)}
          </ExpansionBlock>
          <ExpansionBlock title="User Details">
            {this.composeField('sap_id', 'number')}
            {this.composeField('name', 'string')}
            {this.composeField('rm_sap_id', 'number')}
            {this.composeField('badge', 'number')}
          </ExpansionBlock>
          <ExpansionBlock title="Project Details">
            {this.composeField('client', 'string')}
            {this.composeField('project', 'string')}
            {this.composeField('project_code', 'string')}
          </ExpansionBlock>
          <ExpansionBlock
            title="Shift Options"
            subtitle={default_night && default_normal && default_morning ? 'DEFAULT' : 'CUSTOM'}
            variant="subtitle1"
            clean>
            <ExpansionBlock
              title="Morning Shift"
              subtitle={default_morning ? 'DEFAULT' : 'CUSTOM'}
              variant="subtitle2"
              color="#defdfb">
              {this.composeTimeField('morning_start')}
              {this.composeTimeField('morning_end')}
              {default_morning ? null : <Button onClick={this.resetShift('morning')}>reset</Button>}
            </ExpansionBlock>
            <ExpansionBlock
              title="Noraml Shift"
              subtitle={default_normal ? 'DEFAULT' : 'CUSTOM'}
              variant="subtitle2"
              color="#6584d8">
              {this.composeTimeField('normal_start')}
              {this.composeTimeField('normal_end')}
              {default_normal ? null : <Button onClick={this.resetShift('normal')}>reset</Button>}
            </ExpansionBlock>
            <ExpansionBlock
              title="Night Shift"
              subtitle={default_night ? 'DEFAULT' : 'CUSTOM'}
              textColor="ivory"
              variant="subtitle2"
              color="#632b6c">
              {this.composeTimeField('night_start', 'ivory')}
              {this.composeTimeField('night_end', 'ivory')}
              {default_night ? null : (
                <Button style={{ color: 'ivory' }} onClick={this.resetShift('night')}>
                  reset
                </Button>
              )}
            </ExpansionBlock>
          </ExpansionBlock>
          <div />
        </ValidatorForm>
      </Dialog>
    );
  }
  validators = {
    email: ['required', 'isEmail', 'matchRegexp:.*@hcl.[a-z]{2,3}$'],
    sap_id: ['matchRegexp:^[0-9]{8}$'],
    name: ['matchRegexp:^[\u00C0-\u017Fa-zA-ZñÑ, ]+$'],
    rm_sap_id: ['matchRegexp:^[0-9]{8}$'],
    badge: ['matchRegexp:^[0-9]{0,8}$']
  };
  errorMessages = {
    sap_id: ['The Sap Id should be eight numbers long'],
    name: ['Only letters are allowed'],
    rm_sap_id: ['The Rm Id should be eight numbers long'],
    badge: ['The Badge Id should be up to eight numbers long'],
    email: ['This field is required', 'Email is not valid', 'Email should be from the enterpice']
  };
  tooltips = () => ({
    sap_id: 'The User sap_id',
    name: 'The Full Name of the User',
    rm_sap_id: 'The User Reporting Manager sap_id',
    badge: 'The id of the badge',
    client: 'The client the user works for',
    project: 'The project the user works on',
    project_code: 'The project id',
    email: 'The email used by the user to acces the app',
    night_start: 'The start time of the night shift, time goes on 24 hour format',
    night_end: 'The end time of the night shift, time goes on 24 hour format',
    normal_start: 'The start time of the normal shift, time goes on 24 hour format',
    normal_end: 'The end time of the normal shift, time goes on 24 hour format',
    morning_start: 'The start time of the morning shift, time goes on 24 hour format',
    morning_end: 'The end time of the morning shift, time goes on 24 hour format'
  });
  composeField = (id, type, required = true) => {
    const { classes } = this.props;
    return (
      <Tooltip title={this.tooltips()[id]}>
        <TextValidator
          required={required}
          id={id}
          label={separateCamelCase(id, true)}
          name={separateCamelCase(id, true)}
          onChange={this.onInputChange(id)}
          className={classes.textField}
          value={this.state[id]}
          margin="normal"
          type={type}
          validators={this.validators[id]}
          errorMessages={this.errorMessages[id]}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            readOnly: this.idEditable(id)
          }}
        />
      </Tooltip>
    );
  };
  composeTimeField = (id, textColor) => {
    const { classes } = this.props;
    return (
      <Tooltip title={this.tooltips()[id]}>
        <TextValidator
          style={{ color: textColor ? textColor : 'default', width: 130 }}
          required
          id={id}
          label={separateCamelCase(id, true)}
          name={separateCamelCase(id, true)}
          onChange={this.onInputChange(id)}
          className={classes.textField}
          value={this.state[id]}
          margin="normal"
          type="time"
          validators={this.validators[id]}
          errorMessages={this.errorMessages[id]}
          InputLabelProps={{ shrink: true, style: { color: textColor ? textColor : 'default' } }}
          InputProps={{
            classes: {
              underline: textColor ? classes.underline : classes.underlinef
            },
            style: {
              color: textColor ? textColor : 'default'
            },
            endAdornment: (
              <InputAdornment position="end">
                <Typography
                  variant="body2"
                  color="inherit"
                  style={{ color: textColor ? textColor : 'default' }}>
                  hh:mm
                </Typography>
              </InputAdornment>
            ),
            inputProps: {
              style: { color: textColor ? textColor : 'default' }
            }
          }}
        />
      </Tooltip>
    );
  };
  idEditable = id => {
    let editable = id === 'sap_id' && this.props.match.params.id !== 'new';
    return editable;
  };
  save = event => {
    event.preventDefault();
    console.log('Save some data');
    let {
      sap_id,
      name,
      rm_sap_id,
      badge,
      client,
      project,
      project_code,
      email,
      night_start,
      night_end,
      normal_start,
      normal_end,
      morning_start,
      morning_end,
      default_night,
      default_normal,
      default_morning
    } = this.state;
    this.setLoading('save', true);
    this.setState({ pendingUpdate: false });
    let data = {
      sap_id,
      name,
      rm_sap_id,
      badge,
      client,
      project,
      project_code,
      email
    };
    if (!default_morning) {
      data['morning_start'] = morning_start;
      data['morning_end'] = morning_end;
    }
    if (!default_normal) {
      data['normal_start'] = normal_start;
      data['normal_end'] = normal_end;
    }
    if (!default_night) {
      data['night_start'] = night_start;
      data['night_end'] = night_end;
    }
    db.collection('users')
      .doc(String(sap_id))
      .set(data)
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
}
function Transition(props) {
  return <Slide direction="up" {...props} />;
}
const styles = theme => ({
  underlinef: {},
  underline: {
    '&:after': {
      borderBottom: `2px solid wheat`
    },
    '&:before': {
      borderBottom: `1px solid ivory`
    },
    '&:hover': {
      borderBottom: `1px solid ivory`
    },
    '&:hover:before': {
      borderBottom: `1px solid lightgoldenrodyellow !important`
    }
  },
  flex: {
    flex: 1,
    textAlign: 'center'
  },
  appBar: {
    position: 'relative'
  },
  save: {
    position: 'relative'
  },
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
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#eee'
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200
  },
  dense: {
    marginTop: 19
  },
  menu: {
    width: 200
  }
});
export default withStyles(styles)(EditUserForm);
