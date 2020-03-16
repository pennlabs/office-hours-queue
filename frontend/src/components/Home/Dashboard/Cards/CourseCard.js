import React from 'react'
import { Segment, Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import * as ROUTES from '../../../../constants/routes';

const cardStyle = {
  height:"110px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
}

const hoverStyle = {
  height:"110px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  backgroundColor: "#dedede"
}

export default class CourseCard extends React.Component {
  render() {
    const path = {
      pathname: this.props.kind === 'STUDENT' ? ROUTES.STUDENT : ROUTES.COURSE,
      state: { courseId: this.props.id, courseUserId: this.props.courseUserId }
    };

  return (
    <Link to={ path }>
      <Segment basic>
        <Segment attached="top" style={{height:"70px"}}>
          <Header style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}>
            { `${this.props.department} ${this.props.courseCode}`}
            <Header.Subheader style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}>
              { this.props.courseTitle }
            </Header.Subheader>
          </Header>
        </Segment>
        <Segment attached="bottom" secondary textAlign="right" style={{height:"40px"}}>
          <Header as="h6" style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}>
            { this.props.semester } { this.props.year }
          </Header>
        </Segment>
      </Segment>
    </Link>
  );
}
}
