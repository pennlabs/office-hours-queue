import React from 'react';

import AuthUserContext from './context';
import firebase from '../Firebase';
import LoadingContext from "../LandingPage/context";

const withAuthentication = Component => {
  class WithAuthentication extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        authUser: JSON.parse(localStorage.getItem('authUser')),
        loading: true,
      };
    }

    componentDidMount() {
      this.listener = firebase.auth.onAuthStateChanged(
        async (authUser) => {
          const deepCopy = JSON.parse(JSON.stringify(authUser));
          if (authUser) {
            const result = await authUser.getIdTokenResult();
            deepCopy['hasUserObject'] = result.claims.hasUserObject;
          }
          const stringy = JSON.stringify(deepCopy);
          localStorage.setItem('authUser', stringy);
          this.setState({ authUser: deepCopy, loading: false });
        },
        () => {
          localStorage.removeItem('authUser');
          this.setState({ authUser: null });
        },
      );
    }

    componentWillUnmount() {
      this.listener();
    }

    render() {
      return (
        <AuthUserContext.Provider value={this.state.authUser}>
          <LoadingContext.Provider value={this.state.loading}>
            <Component {...this.props} />
          </LoadingContext.Provider>
        </AuthUserContext.Provider>
      );
    }
  }

  return WithAuthentication;
};

export default withAuthentication;
