import React from 'react';
import { BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import * as ROUTES from '../constants/routes';

import LandingPage from './LandingPage/LandingPage';
import Dashboard from './Dashboard/Dashboard';
import Roster from './Roster/Roster';
import RosterSem from './Roster/Roster';
import Queue from './Queue/Queue';

import { withAuthentication } from './Session';

class App extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
        <Route exact path={ROUTES.LANDING} component={ LandingPage }/>
        <Route exact path={ROUTES.DASHBOARD} component={ Dashboard }/>
        <Route exact path={ROUTES.ROSTER} component={ Roster }/>
        <Route exact path={ROUTES.QUEUE} component={ Queue }/>
        <Route component={ Dashboard }/>
        </Switch>
      </Router>
    );
  }
}

export default withAuthentication(App);
