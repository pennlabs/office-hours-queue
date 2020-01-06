import React from 'react';
import { Segment, Header } from 'semantic-ui-react';

// Button that allows students to add questions to a certain queue
export default class AddCard extends React.Component {
  render() {
    return (
      <Segment basic>
        <Segment inverted color="green"
          onClick={this.props.clickFunc}
        >
          <Header
            content="Ask Question"
          />
        </Segment>
      </Segment>
    );
  }
}
