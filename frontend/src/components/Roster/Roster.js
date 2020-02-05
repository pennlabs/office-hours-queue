import React, { useState, useEffect } from 'react';
import { Segment, Header, Grid } from 'semantic-ui-react';
import Sidebar from '../Sidebar';
import SubSidebar from '../Sidebar/SubSidebar';
import RosterTable from './RosterTable';

import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

import { withAuthorization } from '../Session';
import { compose } from 'recompose';

/* GRAPHQL QUERIES/MUTATIONS */
const GET_COURSE = gql`
  query course($id: ID!) {
    course(id: $id) {
      id
      department
      name
      description
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

const Roster = (props) => {
  /* GRAPHQL QUERIES/MUTATIONS */
  const { loading, error, data, refetch } = useQuery(GET_COURSE, { variables: {
    id: props.location.state.courseId
  }});

  /* STATE */
  const [users, setUsers] = useState([]);
  const [course, setCourse] = useState({ department: null, name: null, description: null})

  /* LOAD USERS */
  if (data && data.course) {
    var allUsers = []
    data.course.courseUsers.edges.map(item => {
      allUsers.push({
        fullName: item.node.user.fullName,
        preferredName: item.node.user.preferredName,
        email: item.node.user.email,
        role: item.node.kind
      })
    });

    var newCourse = {
      department: data.course.department,
      name: data.course.name,
      description: data.course.description
    }

    if (JSON.stringify(allUsers) != JSON.stringify(users) ||
        JSON.stringify(newCourse) != JSON.stringify(course)) {
      setUsers(allUsers);
      setCourse(newCourse);
    }
  }

  useEffect(() => {
    refetch();
  }); 

  return (
    data ? <Grid columns={2} divided="horizontally" style={{"width":"100%"}}>
      <Sidebar active='dashboard'/>
      <SubSidebar active={'roster'} courseId={ props.location.state.courseId }/>
      <Grid.Column width={10}>
        <Grid padded>
          <Grid.Row>
            <Segment basic>
              <Header as="h1">
                Roster
              </Header>
            </Segment>
          </Grid.Row>
          <Grid.Row>
            <RosterTable users={ users }/>
          </Grid.Row>
        </Grid>
      </Grid.Column>
    </Grid> : <Grid></Grid>
  );
}


const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
)(Roster);
