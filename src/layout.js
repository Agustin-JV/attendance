import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import { Badge, Button } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { MoreVert } from '@material-ui/icons';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { Menu, MenuItem } from '@material-ui/core';
import { mainListItems, shitsListItems, appListItems, myAccountListItems } from './listItems';
import { Route } from 'react-router-dom';
import firebase from './fire_init';
class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      title: 'Home',
      anchorEl: null
    };
    //this.onDelayChange = this.onDelayChange.bind(this)
  }
  componentDidMount() {}
 
  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({
      open: false
    });
  };
  getTitle = path => {
    switch (path) {
      case 'dashboard':
        return 'Dashboard 📰';
      case 'wsinf':
        return 'Working Shifts Information 📅';
      case 'projects':
        return 'User Projects 👥';
      case 'upload-files':
        return 'Upload files 📎';
      case 'download-report':
        return 'Shift Reports 📊';
      case 'holidays':
        return 'Holidays 🏖️';
      case 'app-security':
        return 'Security 🛡️';
      case 'schedules-rules':
        return '📅 Schedule Rules ⚙️';
      case 'settings':
        return 'Settings ⚙️';
      case 'app-settings':
        return '🏢 App Settings ⚙️';
      default:
        return path;
    }
  };
  onLogOut = () => {
    this.handleCloseUserMenu();
    firebase
      .auth()
      .signOut()
      .then(this.logOutSucces, function(error) {
        console.error('Sign Out Error', error);
      });
  };
  logOutSucces = () => {
    //console.log('Signed Out', firebase.auth().currentUser ? true : false);
    this.props.auth();
  };
  handleCloseUserMenu = () => {
    this.setState({ anchorEl: null });
  };
  handleClickUserMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };
  render() {
    const { anchorEl } = this.state;
    const { classes } = this.props;
    return (
      <div style={{ maxHeight: '100%', overflow: 'hidden' }}>
        <AppBar
          position="fixed"
          className={classNames(classes.appBar, this.state.open && classes.appBarShift)}>
          <Toolbar disableGutters={!this.state.open} className={classes.toolbar}>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerOpen}
              className={classNames(
                classes.menuButton,
                this.state.open && classes.menuButtonHidden
              )}>
              <MenuIcon />
            </IconButton>
            <Route
              path="/:id"
              render={({ match }) => (
                <Typography
                  component="h1"
                  variant="h6"
                  color="inherit"
                  noWrap
                  className={classes.title}>
                  {this.getTitle(match.params.id)}
                </Typography>
              )}
            />
            <IconButton color="inherit">
              <Badge badgeContent={1} invisible={true} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.handleCloseUserMenu}>
              <MenuItem onClick={this.handleCloseUserMenu}>Profile {'<comming soon>'}</MenuItem>
              <MenuItem onClick={this.handleCloseUserMenu}>My account {'<comming soon>'}</MenuItem>
              <MenuItem onClick={this.onLogOut}>Logout</MenuItem>
            </Menu>
            <IconButton color="inherit" onClick={this.handleClickUserMenu}>
              <MoreVert />
            </IconButton>
          </Toolbar>
        </AppBar>
        <div className={classes.root}>
          <CssBaseline />
          <Drawer
            variant="permanent"
            classes={{
              paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose)
            }}
            open={this.state.open}>
            <div className={classes.toolbarIcon}>
              <IconButton onClick={this.handleDrawerClose}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            <Divider />
            <div className={classes.drawer}>
              <List>{mainListItems}</List>
              <Divider />
              <List>{shitsListItems}</List>
              <Divider />
              <List>{appListItems}</List>
              <Divider />
              <List>{myAccountListItems}</List>
            </div>
          </Drawer>
          <div className={classes.content}>
            <div className={classes.appBarSpacer} />
            <div className={classes.content2}>
              <main className={classes.content3}>{this.props.children}</main>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
Layout.propTypes = {
  classes: PropTypes.object.isRequired
};
const drawerWidth = 240;
const styles = theme => ({
  root: {
    display: 'flex',
    height: '-webkit-fill-available',
    overflow: 'hidden'
  },
  toolbar: {
    paddingRight: 24 // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36
  },
  menuButtonHidden: {
    display: 'none'
  },
  title: {
    flexGrow: 1
  },
  drawer: {
    overflow: 'hidden',
    '&:hover': {
      overflowY: 'auto',
      overflowX: 'hidden',
      '&::-webkit-scrollbar': {
        width: '5px',
        height: '5px'
      }
    }
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    height: '100%'
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    minWidth: 71,
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit * 9
    },
    height: '100%'
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  content2: {
    height: '-webkit-fill-available',
    overflow: 'auto'
  },
  content3: {
    padding: theme.spacing.unit * 3,
    height: 'auto',
    minWidth: '100%',
    width: 'fit-content'
  },
  chartContainer: {
    marginLeft: 22
  },
  h5: {
    marginBottom: theme.spacing.unit * 2
  }
});

export default withStyles(styles)(Layout);
