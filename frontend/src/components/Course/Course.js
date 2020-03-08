import React, { useState } from 'react';
import Roster from './Roster/Roster';
import CourseSettings from './CourseSettings/CourseSettings';
import InstructorQueuePage from './InstructorQueuePage/InstructorQueuePage';
import Analytics from './Analytics/Analytics';
import CourseSidebar from './CourseSidebar';
import Summary from './Summary/Summary';
import { Grid, Segment, Header } from 'semantic-ui-react';

import { withAuthorization } from '../Session';
import { compose } from 'recompose';

import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

/* GRAPHQL QUERIES/MUTATIONS */
const GET_COURSE = gql`
  query GetCourse($id: ID!) {
    course(id: $id) {
      id
      department
      courseCode
      courseTitle
      description
      year
      semester
      inviteOnly
    }
  }
`;

const Course = (props) => {
  /* GRAPHQL QUERIES/MUTATIONS */
  const courseId = props.location.state ? props.location.state.courseId : "";
  const courseQuery = useQuery(GET_COURSE, { variables: {
    id: courseId
  }});

  /* STATE */
  const [active, setActive] = useState('queues');
  const [course, setCourse] = useState({});

  /* LOAD DATA FUNCTIONS */
  const loadCourse = (data) => {
    if (data && data.course) {
      return {
        id: data.course.id,
        department: data.course.department,
        courseCode: data.course.courseCode,
        courseTitle: data.course.courseTitle,
        description: data.course.description,
        year: data.course.year,
        semester: data.course.semester,
        inviteOnly: data.course.inviteOnly
      }
    } else {
      return {}
    }
  };

  /* UPDATE STATE */
  if (courseQuery && courseQuery.data) {
    const newCourse = loadCourse(courseQuery.data);
    if (JSON.stringify(newCourse) !== JSON.stringify(course)) {
      setCourse(newCourse);
    }
  }

  /* UPDATE STATE ON QUERY */
  return (
    <Grid columns={2} divided="horizontally" style={{"width":"100%"}}>
      <CourseSidebar active={ active } clickFunc={ setActive }/>

      <Grid.Column width={13}>
        {
          course.department && <Grid.Row>
            <Segment basic>
              <Header as="h1">
                { course.department + " " + course.courseCode }
                <Header.Subheader>
                  { course.courseTitle }
                </Header.Subheader>
              </Header>
            </Segment>
          </Grid.Row>
        }
        {
          courseQuery.data && active === 'roster' &&
          <Roster course={ course }/>
        }
        {
          courseQuery.data && active === 'course_settings' &&
          <CourseSettings course={ course } refetch={ courseQuery.refetch }/>
        }
        {
          courseQuery.data && course && active === 'queues' &&
          <InstructorQueuePage course={ course } />
        }
        {
          active === 'analytics' &&
          <Analytics course={ course }/>
        }
        {
          courseQuery.data && active === 'summary' &&
          <Summary course={ course }/>
        }
      </Grid.Column>
    </Grid>
  )
}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
)(Course);
