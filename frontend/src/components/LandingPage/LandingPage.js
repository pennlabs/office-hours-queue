import React from 'react';
import { Button, Segment } from 'semantic-ui-react';

export default class LandingPage extends React.Component {
  constructor(props) {
    super(props);
  }

  //replace button with google auth button
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
        <Button href="/dashboard" color="blue" >Sign-in with Google</Button>
      </div>

    );
  }
}
