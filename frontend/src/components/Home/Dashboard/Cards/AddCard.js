import React from 'react';
import { Segment, Header } from 'semantic-ui-react';

export default class AddCard extends React.Component {

  render() {
    return (
      <Segment basic>
        <Segment inverted color="green"
          style={{
            "height":"110px",
            "width":"192px",
            "display": "flex",
            "alignItems": "center",
            "justifyContent": "center",
            "cursor": "pointer",
          }}
          onClick={this.props.clickFunc}
          >
          <Header
            content="Add Course"
          />
        </Segment>
      </Segment>
    );
  }
}
