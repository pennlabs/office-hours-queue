import React from 'react';
import { Grid, Button, Segment } from 'semantic-ui-react';
import GoogleButton from 'react-google-button';
import "typeface-roboto";

export default class LandingPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div
        style={{
          "height":"100%",
          "width":"100%",
          "display":"flex",
          "align-items": "center",
          "justify-content":"center"
        }}>
        <Grid columns={1} textAlign="center">
          <Grid.Row><img src="ohq-login.png" width="600px"/></Grid.Row>
          <Grid.Row><GoogleButton onClick={() => { window.location = "/dashboard"}}/></Grid.Row>
        </Grid>
      </div>

    );
  }
}
