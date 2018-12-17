import React from 'react';
import { Avatar } from '@material-ui/core';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { BarChart, People, Dashboard } from '@material-ui/icons';
import { Schedule, Settings, Person, Domain } from '@material-ui/icons';
import { BeachAccess, EventNote, Unarchive, Security } from '@material-ui/icons';
import { Link } from 'react-router-dom';

const LinkListItem = (link, icon, label) => {
  return (
    <Link to={link}>
      <ListItem button>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={label} />
      </ListItem>
    </Link>
  );
};
const Subheader = (icon, label) => {
  return (
    <ListItem style={{ paddingLeft: 15 }}>
      <Avatar>{icon}</Avatar>
      <ListItemText secondary={label} />
    </ListItem>
  );
};

export const mainListItems = (
  <div>
    {LinkListItem('/dashboard', <Dashboard />, 'Dashboard')}
    {LinkListItem('/wsinf', <EventNote />, 'Calendars')}
    {LinkListItem('/projects', <People />, 'Users')}
    {LinkListItem('/upload-files', <Unarchive />, 'Upload Files')}
    {LinkListItem('/download-report', <BarChart />, 'Reports')}
  </div>
);

//<ListSubheader inset>Shifts</ListSubheader>
export const shitsListItems = (
  <div>
    {Subheader(<Schedule />, 'Shift')}
    {LinkListItem('/schedules-rules', <Settings />, 'Schedules Rules')}
    {LinkListItem('/holidays', <BeachAccess />, 'Holidays')}
  </div>
);

export const appListItems = (
  <div>
    {Subheader(<Domain />, 'App')}
    {LinkListItem('/app-settings', <Settings />, 'App Settings')}
    {LinkListItem('/app-security', <Security />, 'App Security')}
  </div>
);

export const myAccountListItems = (
  <div>
    {Subheader(<Person />, 'My Account')}
    {LinkListItem('/settings', <Settings />, 'Settings2')}
  </div>
);
