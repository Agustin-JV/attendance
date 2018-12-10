import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Layout from './layout';
import UserShifts from './userShifts';
import Home from './home';
import UserProjects from './userProjects';
import HolydayPlanner from './holidayPlanner';
import SecurityPannel from './securityPannel';
const InApp = props => (
  <Router>
    <Layout auth={props.auth}>
      <Route exact path="/home" component={Home} />
      <Route path="/wsinf" component={UserShifts} />
      <Route path="/projects" component={UserProjects} />
      <Route path="/holidays" component={HolydayPlanner} />
      <Route path="/security" component={SecurityPannel} />
    </Layout>
  </Router>
);

export default InApp;
