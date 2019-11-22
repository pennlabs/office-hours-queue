import React from 'react';
import { Switch, Route } from 'react-router-dom';
import * as ROUTES from '../constants/routes';

import LandingPage from './LandingPage/LandingPage';
import Dashboard from './Dashboard/Dashboard';

export default class App extends React.Component {
  render() {
    return (
      <Switch>
        <Route path={ROUTES.LANDING} component={ LandingPage }/>
        <Route path={ROUTES.DASHBOARD} component={ Dashboard }/>
      </Switch>
    );
  }
}
