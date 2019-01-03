import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import InApp from './inapp';
import Home from './home';
import firebase from './fire_init';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
const store = configureStore();
class AppRouter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: firebase.auth().currentUser ? true : false
    };
    //this.onDelayChange = this.onDelayChange.bind(this)
  }
  revalidate = () => {
    this.setState({
      isAuthenticated: firebase.auth().currentUser ? true : false
    });
  };
  componentDidMount(){
    this.setState({
      isAuthenticated: firebase.auth().currentUser ? true : false
    });
  }
  render() {
    return (
      <SnackbarProvider maxSnack={3}>

      <Router>
      <Provider store={store}>
        <div style={{height:'100%'}}>
          <Route
            exact
            path="/"
            render={() => (this.state.isAuthenticated ? <Redirect to="/dashboard" /> : null)}
          />
          <Route
            exact
            path="/:id"
            render={() => (this.state.isAuthenticated ? null : <Redirect to="/" />)}
          />
          <Route exact path="/" render={() => <Home auth={this.revalidate} />} />

          <Route exact path="/:id" render={() => <InApp auth={this.revalidate} />} />
        </div>
        </Provider>
      </Router>
      </SnackbarProvider>
    );
  }
}

export default AppRouter;
