import React from 'react';
import { Segment, Header, Grid } from 'semantic-ui-react';
import ArchivedCourseCard from './ArchivedCourseCard';
import InstructorCourses from './InstructorCourses';
import StudentCourses from './StudentCourses';


import Sidebar from '../Sidebar';

import { withAuthorization } from '../Session';
import { compose } from 'recompose';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    console.log(this.props.firebase.auth.currentUser ? this.props.firebase.auth.currentUser.email : "hello");

    return (
      <Grid columns={2} divided="horizontally" style={{"width":"100%"}}>
        <Sidebar active={'dashboard'}/>
        <Grid.Column width={13}>
          <Grid padded>

            <Segment basic padded>
              <Header as="h2">
                <Header.Content>
                  Student Courses
                </Header.Content>
              </Header>
            </Segment>
            <StudentCourses/>

            <Segment basic padded>
              <Header as="h2">
                <Header.Content>
                  Instructor Courses
                </Header.Content>
              </Header>
            </Segment>
            <InstructorCourses/>
          </Grid>
        </Grid.Column>
      </Grid>
    );
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
)(Dashboard);
