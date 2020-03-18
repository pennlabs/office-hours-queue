import React, { useState } from 'react';
import { Grid, Loader, Segment, Dimmer } from 'semantic-ui-react'
import Course from '../Course/Course';
import Student from '../Student/Student'

import { Redirect } from 'react-router-dom';
import { withAuthorization } from '../Session';
import { compose } from 'recompose';

import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

const COURSE_PRETTY = gql`
  query CoursePretty($coursePrettyId: String!) {
    coursePretty(coursePrettyId: $coursePrettyId) {
      id
      currentCourseUserKind
    }
  }
`;

const Main = (props) => {
  const { data, error } = useQuery(COURSE_PRETTY, {
    variables: {
      coursePrettyId: props.match.params.prettyid
    }
  });

  const [id, setId] = useState(null);
  const [kind, setKind] = useState(null);

  const isLeader = (kind) => {
    return kind === "HEAD_TA" || kind === "PROFESSOR";
  };

  if (data && data.coursePretty) {
    if (id !== data.coursePretty.id) {
      setId(data.coursePretty.id)
      setKind(data.coursePretty.currentCourseUserKind);
    }
  }

  return (
    error ? <Redirect to={'/'}/> :
    <Grid columns="equal" divided style={{"width":"100%"}} stackable>
      {
        kind === 'STUDENT' && <Student id={ id }/>
      }
      {
        kind && kind !== 'STUDENT' && <Course id={ id } leader={ isLeader(kind) }/>
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
