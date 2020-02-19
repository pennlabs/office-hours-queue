import React from 'react'
import { Segment, Header, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import * as ROUTES from '../../../../constants/routes';

export default class CourseCard extends React.Component {
  render() {
    const path = {
      pathname: this.props.kind === 'STUDENT' ? ROUTES.STUDENT : ROUTES.COURSE,
      state: { courseId: this.props.id, }
    }

    return (
      <Segment basic>
        <Segment attached="top" color="blue" style={{"height":"70px", "width":"192px"}}>
          <Link to={ path }>
          <Header
            content={this.props.department + " " + this.props.name}
            subheader={
              this.props.description.length <= 20 ? this.props.description :
              this.props.description.substring(0, 20) + "..." }/>
            </Link>
        </Segment>
        <Segment attached="bottom" secondary textAlign="right" style={{"height":"40px", "width":"192px"}}>
          <Header as="h6">
            <Header.Content>
              { this.props.semester }
            </Header.Content>
          </Header>
        </Segment>
      </Segment>
    );
  }
}
