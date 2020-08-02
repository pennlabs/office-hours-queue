import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import * as ROUTES from '../constants/routes';

import LandingPage from './LandingPage/LandingPage';
import Main from './Main/Main';

import firebase from './Firebase';
import LoadingContext from "./LandingPage/context";
import AuthUserContext from "./Session/context";

const App = () => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => firebase.auth.onAuthStateChanged(
    async (authUser) => {
      if (authUser === null) {
        setAuthUser(null);
      } else {
        const result = await authUser.getIdTokenResult();
        if (result.claims.hasUserObject) {
          const deepCopy = JSON.parse(JSON.stringify(authUser));
          deepCopy['hasUserObject'] = true;
          setAuthUser(deepCopy);
        }
      }
      setLoading(false);
    },
    (error) => {
      setAuthUser(null);
    }
  ), []);

  return (
    <AuthUserContext.Provider value={authUser}>
      <LoadingContext.Provider value={loading}>
        <Router>
          <Switch>
            <Route
              exact path={ROUTES.LANDING}
              render={(props) => <LandingPage {...props} setAuthUser={setAuthUser} setLoading={setLoading}/>}/>
            <Route exact path={ROUTES.CLASS} component={ Main }/>
            <Redirect to="/" />
          </Switch>
        </Router>
      </LoadingContext.Provider>
    </AuthUserContext.Provider>
  )
};

export default App;
