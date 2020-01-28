import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { Grid } from 'semantic-ui-react';

import { withFirebase } from '../Firebase';

import GoogleButton from 'react-google-button';
import "typeface-roboto";

import * as ROUTES from '../../constants/routes';

import Dashboard from '../Dashboard/Dashboard';

import AuthUserContext from '../Session/context';

import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

const TEST = gql`
  {
    joinableCourses(department: "ECON") {
      edges {
        node {
          name
        }
      }
    }
  }
`;

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
    const condition = authUser => !!authUser;

    const Test = () => {
      const { loading, error, data } = useQuery(TEST);
  
      if (loading) {
        return <div>Error! {loading.message}</div>;
      }
  
      if (error) {
        console.log(error);
        return <div>Error! {error.message}</div>;
      }
    
      return (
        <ul>
          {
            data.edges.map(({node}) => (
              <div>node.name</div>
            ))
          }
        </ul>
      );
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
                  <Grid.Row><GoogleButton onClick={this.onSubmit}/></Grid.Row>
                  <Test/>
                </Grid>
              </div> 
          }
      </AuthUserContext.Consumer>
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
