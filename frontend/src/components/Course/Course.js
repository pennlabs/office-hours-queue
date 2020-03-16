import React, { useState, useEffect } from 'react';
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
      requireVideoChatUrlOnQuestions
      enableVideoChat
      leadership {
        id
        kind
        user {
          id
          fullName
          email
        }
      }
    }
  }
`;

const Course = (props) => {
  /* GRAPHQL QUERIES/MUTATIONS */
  const courseId = props.location.state ? props.location.state.courseId : "";
  const courseUserId = props.location.state ? props.location.state.courseUserId : "";
  const courseQuery = useQuery(GET_COURSE, { variables: {
    id: courseId
  }});

  /* STATE */
  const [active, setActive] = useState('queues');
  const [course, setCourse] = useState({});
  const [leader, setLeader] = useState(false);

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
        inviteOnly: data.course.inviteOnly,
        requireVideoChatUrlOnQuestions: data.course.requireVideoChatUrlOnQuestions,
        leadership: data.course.leadership,
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
      setLeader(newCourse.leadership.map(courseUser => courseUser.id).includes(courseUserId));
    }
  }

  /* UPDATE STATE ON QUERY */
  return (
    <Grid columns={2} divided="horizontally" style={{"width":"100%"}} stackable>
      <CourseSidebar active={ active } clickFunc={ setActive } leader={ leader } leadership={ course.leadership }/>
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
          <Roster course={ course }
            courseUserId={ courseUserId }
            courseRefetch={ courseQuery.refetch }/>
        }
        {
          courseQuery.data && active === 'course_settings' &&
          <CourseSettings course={ course } refetch={ courseQuery.refetch }/>
        }
        {
          courseQuery.data && active === 'queues' &&
          <InstructorQueuePage course={ course } leader={ leader }/>
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
};

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
)(Course);
