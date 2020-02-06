import React, { useState } from 'react';
import { Segment, Header, Grid } from 'semantic-ui-react';
import InstructorCourses from './InstructorCourses';
import StudentCourses from './StudentCourses';

import { withAuthorization } from '../../Session';
import { compose } from 'recompose';

const Dashboard = (props) => {
  /* STATE */
  const [courses, setCourses] = useState(props.courses);

  const getCourses = (allCourses, isStudent) => {
    var filterCourses = [];
    allCourses.map((course) => {
      if ((isStudent && course.kind === 'STUDENT') || 
        (!isStudent && course.kind !== 'STUDENT')) {
        filterCourses.push(course);
      }
    });
    return filterCourses;
  }

  return (
    <Grid.Column width={13}>
      <Grid padded>
        <Segment basic padded>
          <Header as="h2">
            <Header.Content>
              Student Courses
            </Header.Content>
          </Header>
        </Segment>
        <StudentCourses courses={ getCourses(courses, true) } refetch={ props.refetch }/>
        <Segment basic padded>
          <Header as="h2">
            <Header.Content>
              Instructor Courses
            </Header.Content>
          </Header>
        </Segment>
        <InstructorCourses courses={ getCourses(courses, false) } refetch={ props.refetch }/>
      </Grid>
    </Grid.Column>
  );
}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
)(Dashboard);
