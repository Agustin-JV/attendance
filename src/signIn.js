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
  Grid,
  ButtonBase
} from '@material-ui/core';
class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      errorCode: '',
      errorMessage: ''
    };
    this.emailRef = React.createRef();
  }
  componentDidMount() {
    /*var user = firebase.auth().currentUser;

    if (user) {
      console.log(user, 'loged in');
    } else {
      console.log('loged out');
    }*/
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
      .signInWithEmailAndPassword(this.state.email, this.state.password)
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
    //console.log(errorCode, errorMessage)
    this.setState({
      errorCode: errorCode,
      errorMessage: errorMessage
    });
  };
  getError = () => {
    if (this.state.errorCode === 'auth/user-not-found') {
      return 'user not found';
    }
    return 'aaaa';
  };
  newUser = () => {
    this.props.newUser(true);
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
              Sign in
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
                required
                fullWidth
              />
              <Typography
                component="h1"
                align="center"
                variant="subtitle1"
                style={{ backgroundColor: 'lightblue' }}>
                {this.state.errorMessage}
              </Typography>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}>
                Sign In
              </Button>
            </ValidatorForm>
            <br />
            <Typography align="left" color="primary" variant="button">
              <ButtonBase onClick={this.newUser}>
                <b>Create account</b>
              </ButtonBase>
            </Typography>
          </Paper>
        </main>
      </div>
    );
  }
}

SignIn.propTypes = {
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
export default withStyles(styles)(SignIn);
