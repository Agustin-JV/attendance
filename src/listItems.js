import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import LayersIcon from '@material-ui/icons/Layers';
import { BeachAccess, EventNote, Unarchive, Security } from '@material-ui/icons';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { Route } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { Link } from 'react-router-dom';
export const mainListItems = (
  <div>
    <Link to="/dashboard">
      <ListItem button>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItem>
    </Link>
    <Link to="/wsinf">
      <ListItem button>
        <ListItemIcon>
          <EventNote />
        </ListItemIcon>
        <ListItemText primary="Calendars" />
      </ListItem>
    </Link>
    <Link to="/projects">
      <ListItem button>
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Users" />
      </ListItem>
    </Link>
    <Link to="/upload-files">
      <ListItem button>
        <ListItemIcon>
          <Unarchive />
        </ListItemIcon>
        <ListItemText primary="Upload Files" />
      </ListItem>
    </Link>
    <Link to="/download-report">
      <ListItem button>
        <ListItemIcon>
          <BarChartIcon />
        </ListItemIcon>
        <ListItemText primary="Reports" />
      </ListItem>
    </Link>
  </div>
);

export const secondaryListItems = (
  <div>
    <ListSubheader inset>Saved reports</ListSubheader>
    <ListItem button>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Current month" />
    </ListItem>
    <Link to="/security">
      <ListItem button>
        <ListItemIcon>
          <Security />
        </ListItemIcon>
        <ListItemText primary="Security" />
      </ListItem>
    </Link>
    <Link to="/holidays">
      <ListItem button>
        <ListItemIcon>
          <BeachAccess />
        </ListItemIcon>
        <ListItemText primary="Holidays" />
      </ListItem>
    </Link>
  </div>
);
