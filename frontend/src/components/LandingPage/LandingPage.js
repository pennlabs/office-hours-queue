import React, { Component, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { Grid } from 'semantic-ui-react';

import { withFirebase } from '../Firebase';

import GoogleButton from 'react-google-button';
import "typeface-roboto";

import * as ROUTES from '../../constants/routes';

import Dashboard from '../Dashboard/Dashboard';

import AuthUserContext from '../Session/context';

import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

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


/*createUser(name) {
  

  console.log("hello");
  console.log();
}*/

const SignInGoogleBase = (props) => {
  const [error, setError] = useState(null);
  const condition = authUser => !!authUser;
  const [createUser, { data }] = useMutation(CREATE_USER);

  const onSubmit = event => {
    props.firebase
      .doSignInWithGoogle()
      .then(socialAuthUser => {
        console.log("Wooo!!! I got " + socialAuthUser.user.email + " with name " + socialAuthUser.user.displayName);
        createUser({
          variables: { 
            input:{ 
              fullName: socialAuthUser.user.displayName,
              preferredName: socialAuthUser.user.displayName.split("/[ ,]+/")[0]
            }
          }
        });
      })
      .then(() => {
        setError(null);
        props.history.push(ROUTES.DASHBOARD);
      })
      .catch(error => {
        setError(error);
      });

    event.preventDefault();
  };

  return (
    <AuthUserContext.Consumer>
        {authUser =>
          condition(authUser) 
          ? <Dashboard />
          : <div
              style={{
                "height":"100%",
                "width":"100%",
                "display":"flex",
                "alignItems": "center",
                "justifyContent":"center"
              }}>
              <Grid columns={1} textAlign="center">
                <Grid.Row><img src="ohq-login.png" width="600px" alt=""/></Grid.Row>
                <Grid.Row><GoogleButton onClick={onSubmit}/></Grid.Row>
              </Grid>
            </div> 
        }
    </AuthUserContext.Consumer>
  );
}

const SignInGoogle = compose(
  withRouter,
  withFirebase,
)(SignInGoogleBase);

console.log(withRouter);

const LandingPage = () => {
    return <SignInGoogle />
};

export default LandingPage;
export { SignInGoogle };
