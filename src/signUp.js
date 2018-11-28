import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import LockIcon from '@material-ui/icons/LockOutlined';
import firebase from './fire_init';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import {
  Typography,
  Paper,
  Avatar,
  Button,
  CssBaseline,
  ButtonBase,
  Grid
} from '@material-ui/core';
class SignUP extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      repassword: ''
    };
    this.emailRef = React.createRef();
  }
  componentDidMount() {
    ValidatorForm.addValidationRule('isPasswordMatch', value => {
      if (value !== this.state.password) {
        return false;
      }
      return true;
    });
    ValidatorForm.addValidationRule('uniqueEmail', value => {
      if (value === this.state.inUse) {
        return false;
      }
      return true;
    });

    //var user = firebase.auth().currentUser;
  }
  handleInputChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };
  onSubmit = event => {
    event.preventDefault();
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(this.onSucces, this.onError);
  };
  onSucces = user => {
    //console.log(user);
    this.props.auth();
  };
  onError = error => {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    if (errorCode === 'auth/email-already-in-use' || errorCode === 'auth/invalid-email') {
      this.emailRef.current.makeInvalid();
    }
    this.setState({
      errorCode: errorCode,
      errorMessage: errorMessage,
      emailInUse: errorCode === 'auth/email-already-in-use' ? true : false,
      inUse: this.state.email
    });
  };
  getError = () => {
    if (
      this.state.errorCode !== 'auth/email-already-in-use' &&
      this.state.errorCode !== 'auth/invalid-email'
    ) {
      return this.state.errorMessage;
    }
    return ' ';
  };
  newUser = () => {
    this.props.newUser(false);
  };
  //auth/email-already-in-use The email address is already in use by another account.
  render() {
    const { classes } = this.props;
    return (
      <div>
        <main className={classes.main}>
          <CssBaseline />
          <Paper className={classes.paper}>
            <Grid container justify="center" alignItems="center">
              <Grid item>
                <Avatar className={classes.avatar}>
                  <LockIcon />
                </Avatar>
              </Grid>
            </Grid>
            <Typography component="h1" variant="h5" align="center">
              Sign Up
            </Typography>
            <ValidatorForm className={classes.form} onSubmit={this.onSubmit}>
              <TextValidator
                ref={this.emailRef}
                id="email"
                label="Email Address"
                name="email"
                type="email"
                autoComplete="off"
                value={this.state.email}
                onChange={this.handleInputChange}
                validators={['uniqueEmail']}
                errorMessages={this.state.errorMessage}
                required
                fullWidth
              />
              <TextValidator
                label="Password"
                name="password"
                type="password"
                id="password"
                autoComplete="off"
                onChange={this.handleInputChange}
                value={this.state.password}
                validators={['matchRegexp:^[^s]{6,}$']}
                errorMessages={['Password should be at least 6 characters']}
                required
                fullWidth
              />
              <TextValidator
                label="Repeat Password"
                name="repassword"
                type="password"
                id="repassword"
                autoComplete="off"
                value={this.state.repassword}
                onChange={this.handleInputChange}
                validators={['isPasswordMatch']}
                errorMessages={['Passwords must match']}
                required
                fullWidth
              />
              <Typography
                component="h1"
                align="center"
                variant="subtitle1"
                style={{ backgroundColor: 'lightblue' }}>
                {this.getError}
              </Typography>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}>
                Sign Up
              </Button>
            </ValidatorForm>
            <br />
            <Typography align="left" color="primary" variant="button">
              <ButtonBase onClick={this.newUser}>
                <b>Back</b>
              </ButtonBase>
            </Typography>
          </Paper>
        </main>
      </div>
    );
  }
}

SignUP.propTypes = {
  classes: PropTypes.object.isRequired
};
const styles = theme => ({
  main: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    //alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`
  },
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing.unit
  },
  submit: {
    marginTop: theme.spacing.unit * 3
  }
});
export default withStyles(styles)(SignUP);
