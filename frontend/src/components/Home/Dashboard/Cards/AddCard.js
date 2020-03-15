import React from 'react';
import { Segment, Header } from 'semantic-ui-react';

export default class AddCard extends React.Component {

  render() {
    return (
      <Segment basic>
        <Segment inverted color="green"
          style={{
            height:"110px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={this.props.clickFunc}>
          <Header style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}
            content="Add Course"/>
        </Segment>
      </Segment>
    );
  }
}
