import React from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import firebase from '../Firebase'
import AuthUserContext from './context';
import * as ROUTES from '../../constants/routes';
import LandingPage from '../LandingPage/LandingPage';

const withAuthorization = condition => Component => {
  class WithAuthorization extends React.Component {
    componentDidMount() {
      this.listener = firebase.auth.onAuthStateChanged(
        async (authUser) => {
          if (authUser && !authUser.hasUserObject) {
            const result = await authUser.getIdTokenResult(true);
            authUser['hasUserObject'] = result.claims.hasUserObject;
          }
          if (!condition(authUser)) {
            this.props.history.replace(ROUTES.LANDING);
          }
        },
        () => this.props.history.replace(ROUTES.LANDING),
      );
    }

    componentWillUnmount() {
      this.listener();
    }

    render() {
      return (
        <AuthUserContext.Consumer>
          { authUser =>
            condition(authUser) ? <Component {...this.props} /> : <LandingPage />
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return compose(
    withRouter,
  )(WithAuthorization);
};

export default withAuthorization;
