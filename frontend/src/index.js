/*import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Link, BrowserRouter as Router } from 'react-router-dom'
import './index.css';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Roster from './Roster';
import Dashboard from './Dashboard';
import * as serviceWorker from './serviceWorker';

const routing = (
  <Router>
    <div>
      <Route exact path="/" component={SignIn} />
      <Route path="/SignUp" component={SignUp} />
      <Route path="/SignIn" component={SignIn} />
      <Route path="/Roster" component={Roster} />
      <Route path="/Dashboard" component={Dashboard} />
    </div>
  </Router>
)

ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
*/

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './components/App';
// import * as serviceWorker from './serviceWorker';
import 'semantic-ui-css/semantic.min.css';

import Firebase, { FirebaseContext } from './components/Firebase';

ReactDOM.render(
    <FirebaseContext.Provider value={new Firebase()}>
    <BrowserRouter>
        <App/>
    </BrowserRouter>
    </FirebaseContext.Provider>, 
    document.getElementById('root')
);