import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import * as ROUTES from '../constants/routes';

import LandingPage from './LandingPage/LandingPage';
import Dashboard from './Dashboard/Dashboard';
import Roster from './Roster/Roster';

import { withAuthentication } from './Session';

class App extends React.Component {
  render() {
    return (
      <Router>
        <Route exact path={ROUTES.LANDING} component={ LandingPage }/>
        <Route exact path={ROUTES.DASHBOARD} component={ Dashboard }/>
        <Route exact path={ROUTES.ROSTER} component={ Roster }/>
      </Router>
    );
  }
}

export default withAuthentication(App);