import React from 'react';
import { Switch, Route } from 'react-router-dom';
import LandingPage from './LandingPage/LandingPage';
import Dashboard from './Dashboard/Dashboard';

export default class App extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={ LandingPage }/>
        <Route exact path="/dashboard" component={ Dashboard }/>
      </Switch>
    );
  }
}
