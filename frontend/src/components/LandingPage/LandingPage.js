import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import { withFirebase } from '../Firebase';

import { Grid } from 'semantic-ui-react';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import GoogleButton from 'react-google-button';
import "typeface-roboto";

import * as ROUTES from '../../constants/routes';
import Home from '../Home/Home';
import AuthUserContext from '../Session/context';

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
  const [createUser, { data }] = useMutation(CREATE_USER);
  const [error, setError] = useState(null);
  const condition = (authUser) => {
    if (!authUser) { return false}
    return authUser.hasUserObject;
  };


  const onSubmit = async (event) => {
    try {
      const socialAuthUser = await props.firebase.doSignInWithGoogle();
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
          setError(null);
          props.history.push(ROUTES.LANDING);
      }
    } catch (e) {
      setError(e.message);
    }
    event.preventDefault();
  };

  return (
    <AuthUserContext.Consumer>
      { authUser =>
        condition(authUser)
          ? <Home />
          : <div
            style={{
              "height": "100%",
              "width": "100%",
              "display": "flex",
              "alignItems": "center",
              "justifyContent": "center"
            }}>
            <Grid columns={1} textAlign="center">
              <Grid.Row><img src="ohq-login.png" width="600px" height="107px" alt="logo"/></Grid.Row>
              <Grid.Row><GoogleButton onClick={onSubmit}/></Grid.Row>
            </Grid>
            <Snackbar open={ error } autoHideDuration={6000} onClose={ () => setError(null) }>
              <Alert severity="error" onClose={ () => setError(null) }>
                <span>
                  {
                    error && error.includes("upenn.edu email") ? "Must sign in with a upenn.edu email" :
                    error && error.includes("UniqueConstraint") ? "An account with that PennKey already exists" :
                    "An error occurred, unable to sign in"
                  }
                </span>
              </Alert>
            </Snackbar>
          </div>
      }
    </AuthUserContext.Consumer>
  );
};

const SignInGoogle = compose(
  withRouter,
  withFirebase,
)(SignInGoogleBase);

const LandingPage = () => {
  return <SignInGoogle />
};

export default LandingPage;
export { SignInGoogle };
