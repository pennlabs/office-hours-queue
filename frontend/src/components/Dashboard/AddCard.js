import React from 'react';
import { Segment, Header } from 'semantic-ui-react';

export default class AddCard extends React.Component {

  render() {
    return (
      <Segment basic>
        <Segment inverted color="green"
          style={{
            "height":"110px",
            "width":"205px",
            "display": "flex",
            "align-items": "center",
            "justify-content":"center"
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
