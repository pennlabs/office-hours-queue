import React, { useState } from 'react';
import { Grid } from 'semantic-ui-react'
import Course from '../Course/Course';
import Student from '../Student/Student'

import { withAuthorization } from '../Session';
import { compose } from 'recompose';

import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

const CURRENT_USER = gql`
  {
    currentUser {
      courseUsers {
        edges {
          node {
            id
            course {
              id
              prettyId
            }
            kind
          }
        }
      }
    }
  }
`;

const COURSE_PRETTY = gql`
  query CoursePretty($coursePrettyId: String!) {
    coursePretty(coursePrettyId: $coursePrettyId) {
      id
      currentCourseUserKind
    }
  }
`;

const Main = (props) => {
  const { data } = useQuery(CURRENT_USER);
  const [id, setId] = useState(null);
  const [courseUserId, setCourseUserId] = useState(null);
  const [kind, setKind] = useState(null);

  const getCourseUser = (data, prettyId) => {
    if (!data || !prettyId) return null;

    const courseUserList = data.currentUser.courseUsers.edges.filter(courseUser => 
      courseUser.node.course.prettyId === prettyId
    );
    return courseUserList.length > 0 ? courseUserList[0] : null;
  };

  if (data && data.currentUser) {
    const courseUser = getCourseUser(data, props.match.params.prettyid);
    if (courseUser && courseUser.node.kind !== kind) {
      setKind(courseUser.node.kind);
      setCourseUserId(courseUser.node.id);
      setId(courseUser.node.course.id)
    }
  }

  return (
    <Grid columns={2} divided style={{"width":"100%"}} stackable>
      {
        kind === 'STUDENT' && <Student id={ id }/>
      }
      {
        kind && kind !== 'STUDENT' && <Course id={ id } courseUserId={ courseUserId }/>
      }
    </Grid>
  )
};

const condition = (authUser) => {
  return authUser && authUser.hasUserObject;
};

export default compose(
  withAuthorization(condition),
)(Main);
