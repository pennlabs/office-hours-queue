import React, { useState } from 'react';
import Roster from './Roster/Roster';
import CourseSettings from './CourseSettings/CourseSettings';
import InstructorQueue from './Queue/InstructorQueue/InstructorQueue';
import Analytics from './Analytics/Analytics';
import CourseSidebar from './CourseSidebar';
import Summary from './Summary/Summary';
import { Grid } from 'semantic-ui-react';

import { withAuthorization } from '../Session';
import { compose } from 'recompose';

import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

/* GRAPHQL QUERIES/MUTATIONS */
const GET_COURSE = gql`
  query course($id: ID!) {
    course(id: $id) {
      id
      department
      name
      description
      year
      semester
      inviteOnly
      courseUsers {
        edges {
          node {
            kind
            user {
              fullName
              preferredName
              email
            }
          }
        }
      }
    }
  }
`;

const Course = (props) => {
  /* GRAPHQL QUERIES/MUTATIONS */
  const { loading, error, data, refetch } = useQuery(GET_COURSE, { variables: {
    id: props.location.state.courseId
  }});

  /* STATE */
  const [active, setActive] = useState('course_settings');
  const [course, setCourse] = useState({});
  const [roster, setRoster] = useState([]);

  /* LOAD DATA FUNCTIONS */
  const loadCourse = (data) => {
    var newCourse = {
      id: data.course.id,
      department: data.course.department,
      name: data.course.name,
      description: data.course.description,
      year: data.course.year,
      semester: data.course.semester,
      inviteOnly: data.course.inviteOnly
    }
    return newCourse;
  }

  const loadRoster = (data) => {
    var newRoster = []
    data.course.courseUsers.edges.map((item) => {
      newRoster.push({
        fullName: item.node.user.fullName,
        preferredName: item.node.user.preferredName,
        email: item.node.user.email,
        role: item.node.kind
      })
    });
    return newRoster;
  }

  /* UPDATE STATE */
  if (data && data.course) {
    var newCourse = loadCourse(data);
    var newRoster = loadRoster(data);

    if (JSON.stringify(newCourse) !== JSON.stringify(course)) {
      setCourse(newCourse);
    }

    if (JSON.stringify(newRoster) !== JSON.stringify(roster)) {
      setRoster(newRoster);
    }
  }

  /* UPDATE STATE ON QUERY */

  return (
    <Grid columns={2} divided="horizontally" style={{"width":"100%"}}>
      <CourseSidebar active={ active } clickFunc={ setActive }/>
      {
        data && active === 'roster' &&
        <Roster roster={ roster }/>
      }
      {
        data && active === 'course_settings' &&
        <CourseSettings course={ course }/>
      }
      {
        data && active === 'queue' &&
        <InstructorQueue/>
      }
      {
        data && active === 'analytics' &&
        <Analytics/>
      }
      {
        data && active === 'summary' &&
        <Summary/>
      }
    </Grid>
  )
}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
)(Course);