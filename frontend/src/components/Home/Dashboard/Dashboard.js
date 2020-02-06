import React, { useState, useEffect } from 'react';
import { Segment, Header, Grid } from 'semantic-ui-react';
import InstructorCourses from './InstructorCourses';
import StudentCourses from './StudentCourses';

const Dashboard = (props) => {
  /* STATE */
  const [courses, setCourses] = useState(props.courses);

  const getCourses = (allCourses, isStudent) => {
    var filterCourses = [];
    if (allCourses) {
      allCourses.map((course) => {
        if ((isStudent && course.kind === 'STUDENT') || 
          (!isStudent && course.kind !== 'STUDENT')) {
          filterCourses.push(course);
        }
      });
    }
    return filterCourses;
  }

  /* UPDATE ON PROPS CHANGE */
  useEffect(() => {
    setCourses(props.courses);
  }, [props.courses])

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

export default Dashboard;
