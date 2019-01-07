import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { withSnackbar } from 'notistack';
import Layout from './layout';
import UserShifts from './userShifts';
import Home from './home';
import UserProjects from './userProjects';
import HolydayPlanner from './holidayPlanner';
import SecurityPannel from './securityPannel';
import UploadFiles from './uploadFiles';
import ScheduleRules from './schedule_rules';
import EditUserForm from './editUserForm';
/*
*/
import JsonViewer from './jsonViewer';
/*
        */
const InApp = props => {
  return (
    <Router>
      <Layout auth={props.auth}>
        <Route exact path="/home" component={Home} />
        <Route path="/wsinf" component={UserShifts} />
        <Route path="/projects" component={UserProjects} />
        <Route path="/holidays" component={HolydayPlanner} />
        <Route path="/security" component={SecurityPannel} />
        <Route path="/upload-files" component={UploadFiles} />
        <Route path="/schedules-rules" component={ScheduleRules} />
        <Route path="/projects/user/:id" component={EditUserForm} />
        <Route path="/app-security" component={JsonViewer} />
        {console.log('WATSAP ')}
      </Layout>
    </Router>
  );
};

export default withSnackbar(InApp);
