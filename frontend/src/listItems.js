import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import DashboardIcon from '@material-ui/icons/Reorder';
import FeedbackIcon from '@material-ui/icons/StarHalf';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import SettingsIcon from '@material-ui/icons/SettingsApplications';
import ExitIcon from '@material-ui/icons/ExitToApp';
import { Link } from '@material-ui/core';

export const mainListItems = (
  <div>
    <ListSubheader inset>CIS 121</ListSubheader>
    <ListItem button component="a" href="Dashboard">
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Queues" />
    </ListItem>
    <ListItem button component="a" href="Roster">
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="Roster" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <BarChartIcon />
      </ListItemIcon>
      <ListItemText primary="Statistics" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <FeedbackIcon />
      </ListItemIcon>
      <ListItemText primary="Feedback" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <SettingsIcon />
      </ListItemIcon>
      <ListItemText primary="Settings" />
    </ListItem>
  </div>
);

export const secondaryListItems = (
  <div>
    <ListItem button component="a" href="SignIn">
      <ListItemIcon>
        <ExitIcon />
      </ListItemIcon>
      <ListItemText primary="Log Off" />
    </ListItem>
  </div>
);