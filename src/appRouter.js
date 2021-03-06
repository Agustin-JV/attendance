import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import InApp from './inapp';
import Home from './home';
import firebase from './fire_init';
import { SnackbarProvider } from 'notistack';
import  BasicSnackGenerator  from './basic_snack_generator';
class AppRouter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: firebase.auth().currentUser ? true : false
    };
  }
  revalidate = () => {
    this.setState({
      isAuthenticated: firebase.auth().currentUser ? true : false
    });
  };
  componentDidMount() {
    this.setState({
      isAuthenticated: firebase.auth().currentUser ? true : false
    });
  }
  render() {
    return (
      <SnackbarProvider maxSnack={3}>
        <BasicSnackGenerator />
        <Router>
          <div style={{ height: '100%' }}>
            <Route
              exact
              path="/"
              render={() =>
                this.state.isAuthenticated ? <Redirect to="/dashboard" /> : null
              }
            />
            <Route
              exact
              path="/:id"
              render={() =>
                this.state.isAuthenticated ? null : <Redirect to="/" />
              }
            />
            <Route
              exact
              path="/"
              render={() => <Home auth={this.revalidate} />}
            />
            <Route
              exact
              path="/:id"
              render={() => <InApp auth={this.revalidate} />}
            />
          </div>
        </Router>
      </SnackbarProvider>
    );
  }
}

export default AppRouter;
