import React, { useState } from 'react';
import StudentQueuePage from './StudentQueuePage/StudentQueuePage';
import StudentSidebar from './StudentSidebar';
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
      name
      description
      year
      semester
      inviteOnly
    }
  }
`;

const Student = (props) => {
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
    } else {
      return {}
    }
  }

  /* UPDATE STATE */
  if (courseQuery && courseQuery.data) {
    var newCourse = loadCourse(courseQuery.data);
    if (JSON.stringify(newCourse) !== JSON.stringify(course)) {
      console.log("helo");
      setCourse(newCourse);
    }
  }

  /* UPDATE STATE ON QUERY */
  return (
    <Grid columns={2} divided="horizontally" style={{"width":"100%"}}>
      <StudentSidebar active={ active } clickFunc={ setActive }/>
      <Grid.Column width={13}>
        {
          course.department && <Grid.Row>
            <Segment basic>
              <Header as="h1">
                { course.department + " " + course.name }
                <Header.Subheader>
                  { course.description }
                </Header.Subheader>
              </Header>
            </Segment>
          </Grid.Row>
        }
        {
          courseQuery.data && course && active === 'queues' &&
          <StudentQueuePage course={ course } />
        }
      </Grid.Column>
    </Grid>
  )
}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
)(Student);