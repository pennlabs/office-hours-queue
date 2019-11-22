import React from 'react';
import { Segment, Header } from 'semantic-ui-react';

export default class ArchivedCourseCard extends React.Component {
  
  render() {
    return (
      <Segment basic>
        <Segment attached="top" color="blue" secondary>
          <Header
            content={this.props.code}
            subheader={this.props.title.length < 35 ? this.props.title : this.props.title.substring(0, 25) + "..."}
          />
        </Segment>
        <Segment attached="bottom" tertiary textAlign="right">
          <Header as="h6">
            <Header.Content>
              Archived: {this.props.year}
            </Header.Content>
          </Header>
        </Segment>
      </Segment>
    );
  }
}
