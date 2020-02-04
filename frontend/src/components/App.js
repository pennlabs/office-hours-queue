import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import * as ROUTES from '../constants/routes';

import LandingPage from './LandingPage/LandingPage';
import Dashboard from './Dashboard/Dashboard';
import Roster from './Roster/Roster';
import InstructorQueue from './Queue/InstructorQueue/InstructorQueue'
import StudentQueue from './Queue/StudentQueue/StudentQueue';
import Analytics from './Analytics/Analytics';
import CourseSettings from './CourseSettings/CourseSettings';
import AccountSettings from './AccountSettings/AccountSettings';

import { withAuthentication } from './Session';

const App = () => {
  return (
    <Router>
        <Switch>
          <Route exact path={ROUTES.LANDING} component={ LandingPage }/>
          <Route exact path={ROUTES.DASHBOARD} component={ Dashboard }/>
          <Route exact path={ROUTES.ROSTER} component={ Roster }/>
          <Route exact path={ROUTES.QUEUE} component={ InstructorQueue }/>
          <Route exact path={ROUTES.STUDENTQUEUE} component={ StudentQueue }/>
          <Route exact path={ROUTES.ANALYTICS} component={ Analytics }/>
          <Route exact path={ROUTES.COURSESETTINGS} component={ CourseSettings }/>
          <Route exact path={ROUTES.ACCOUNTSETTINGS} component={ AccountSettings }/>
          <Route component={ Dashboard }/>
        </Switch>
      </Router>
  )
}

export default withAuthentication(App);
