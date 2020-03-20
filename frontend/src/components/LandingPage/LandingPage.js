import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

import { Grid, Dimmer, Loader } from 'semantic-ui-react';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import GoogleButton from 'react-google-button';
import "typeface-roboto";

import * as ROUTES from '../../constants/routes';
import Home from '../Home/Home';
import firebase from '../Firebase';
import AuthUserContext from '../Session/context';
import LoadingContext from "./context";

//graphql mutation for creating user
const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      user {
        id
      }
    }
  }
`;

const SignInGoogleBase = (props) => {
  const [createUser] = useMutation(CREATE_USER);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState(true);

  const condition = (authUser) => {
    return authUser && authUser.hasUserObject;
  };

  const onSubmit = async (event) => {
    try {
      const socialAuthUser = await firebase.doSignInWithGoogle();
      const result = await socialAuthUser.user.getIdTokenResult();
      if (!result.claims.hasUserObject) {
        await createUser({
          variables: {
            input:{
              fullName: socialAuthUser.user.displayName,
              preferredName: socialAuthUser.user.displayName.split("/[ ,]+/")[0]
            }
          }
        });
        setNewUser(true);
        setError(null);
        props.history.push(ROUTES.LANDING);
      }
      const deepCopy = JSON.parse(JSON.stringify(socialAuthUser.user));
      deepCopy['hasUserObject'] = true;
      props.setAuthUser(deepCopy);
      props.setLoading(false);
    } catch (e) {
      setError(e.message);
    }
    event.preventDefault();
  };

  return (
    <AuthUserContext.Consumer>
      { authUser =>
        condition(authUser) ?
          <Home newUser={newUser} setNewUser={setNewUser} /> :
          <LoadingContext.Consumer>
            { loading => loading ? (
              <div style={{
                "height": "100%",
                "width": "100%",
                "display": "flex",
                "alignItems": "center",
                "justifyContent": "center"
              }}>
                <Dimmer active inverted inline='centered'>
                  <Loader size='big' inverted/>
                </Dimmer>
              </div>
              ) :
              <div
                style={{
                  "height": "100%",
                  "width": "100%",
                  "display": "flex",
                  "alignItems": "center",
                  "justifyContent": "center"
                }}>
                <Grid columns={1} textAlign="center">
                  <Grid.Row only="computer tablet"><img src="ohq-login.png" width="600px" height="107px" alt="logo"/></Grid.Row>
                  <Grid.Row only="mobile"><img src="ohq.png" width="217px" height="107px" alt="logo-mini"/></Grid.Row>
                  <Grid.Row>
                    <GoogleButton
                      style={{width: "340px"}}
                      label={"Sign in with Google (upenn.edu)"}
                      onClick={ onSubmit }/>
                  </Grid.Row>
                </Grid>
                <Snackbar open={ error } autoHideDuration={6000} onClose={ () => setError(null) }>
                  <Alert severity="error" onClose={ () => setError(null) }>
                <span>
                  {
                    error && error.includes("upenn.edu email") ? "Must sign in with a upenn.edu email" :
                    error && error.includes("unique_user_user_key") ? "An account with that PennKey already exists" :
                    "An error occurred, unable to sign in"
                  }
                </span>
                  </Alert>
                </Snackbar>
              </div>
            }
          </LoadingContext.Consumer>
      }
    </AuthUserContext.Consumer>
  );
};

const SignInGoogle = compose(
  withRouter,
)(SignInGoogleBase);

const LandingPage = (props) => {
  return <SignInGoogle {...props} />
};

export default LandingPage;
export { SignInGoogle };
