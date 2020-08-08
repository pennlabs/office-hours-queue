import React from 'react';
import { Segment, Header } from 'semantic-ui-react';

export default class ArchivedCourseCard extends React.Component {

  render() {
    return (
      <Segment basic>
        <Segment attached="top" color="blue" secondary>
          <Header style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}>
            { `${this.props.department} ${this.props.courseCode}`}
            <Header.Subheader style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}>
              { this.props.courseTitle }
            </Header.Subheader>
          </Header>
        </Segment>
        <Segment attached="bottom" tertiary textAlign="right">
          <Header as="h6" style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}>
            { this.props.semester }
          </Header>
        </Segment>
      </Segment>
    );
  }
}
