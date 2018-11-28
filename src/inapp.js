import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Layout from './layout';
import BigCalendar from './bigCalendar';
import Home from './home';
import UserProjects from './userProjects';
const InApp = props => (
  <Router>
    <Layout auth={props.auth}>
      <Route exact path="/home" component={Home} />
      <Route path="/wsinf" component={BigCalendar} />
      <Route path="/projects" component={UserProjects} />
    </Layout>
  </Router>
);

export default InApp;
