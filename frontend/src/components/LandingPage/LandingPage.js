import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { Grid } from 'semantic-ui-react';

import { withFirebase } from '../Firebase';

import GoogleButton from 'react-google-button';
import "typeface-roboto";

import * as ROUTES from '../../constants/routes';

class SignInGoogleBase extends Component {
  constructor(props) {
    super(props);

    this.state = { error: null };
  }

  onSubmit = event => {
    this.props.firebase
      .doSignInWithGoogle()
      .then(socialAuthUser => {
        console.log("Wooo!!! I got " + socialAuthUser.user.email + " with name " + socialAuthUser.user.displayName)
        // TODO: check the user against our DB??
      })
      .then(() => {
        this.setState({ error: null });
        this.props.history.push(ROUTES.DASHBOARD);
      })
      .catch(error => {
        this.setState({ error });
      });

    event.preventDefault();
  };

  render() {
    return (
      <div
        style={{
          "height":"100%",
          "width":"100%",
          "display":"flex",
          "alignItems": "center",
          "justifyContent":"center"
        }}>
        <Grid columns={1} textAlign="center">
          <Grid.Row><img src="ohq-login.png" width="600px" alt=""/></Grid.Row>
          <Grid.Row><GoogleButton onClick={this.onSubmit}/></Grid.Row>
        </Grid>
      </div>

    );
  }
}

const SignInGoogle = compose(
  withRouter,
  withFirebase,
)(SignInGoogleBase);

const LandingPage = () => (
    <SignInGoogle />
);

export default LandingPage;

export { SignInGoogle };
