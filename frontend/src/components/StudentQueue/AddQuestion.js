import React from 'react';
import { Segment, Header } from 'semantic-ui-react';

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
