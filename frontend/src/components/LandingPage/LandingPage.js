import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { Grid, Button, Segment } from 'semantic-ui-react';

import { withFirebase } from '../Firebase';
// import * as ROUTES from '../../constants/routes';

import GoogleButton from 'react-google-button';
import "typeface-roboto";

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
      })
      .catch(error => {
        console.log("Fuck, there was an error! " + error)

        this.setState({ error });
      });

    event.preventDefault();
  };

  render() {
    return (
        <GoogleButton onClick={this.onSubmit}/>
    );
  }

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
          <Grid.Row><img src="ohq-login.png" width="600px"/></Grid.Row>
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
