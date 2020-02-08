import React, { useState } from 'react';
import { Segment, Header, Grid } from 'semantic-ui-react';
import RosterTable from './RosterTable';

import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

/* GRAPHQL QUERIES/MUTATIONS */
const GET_USERS = gql`
query GetUsers($id: ID!) {
  course(id: $id) {
    id
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
  const { loading, error, data, refetch } = useQuery(GET_USERS, { variables: {
    id: props.course.id
  }});

  /* STATE */
  const [users, setUsers] = useState(null);

  /* GET USERS FROM DATA */
  const loadUsers = (data) => {
    var newUsers = []
    data.course.courseUsers.edges.map((item) => {
      newUsers.push({
        fullName: item.node.user.fullName,
        preferredName: item.node.user.preferredName,
        email: item.node.user.email,
        role: item.node.kind
      })
    });
    return newUsers;
  }

  /* LOAD DATA */
  if (data && data.course) {
    var newUsers = loadUsers(data);
    if (JSON.stringify(newUsers) !== JSON.stringify(users)) {
      setUsers(newUsers);
    }
  }

  return (
    <div>
      <Grid.Row>
        <Segment basic>
          <Header as="h3">
            Roster
          </Header>
        </Segment>
      </Grid.Row>
      <Grid.Row>
        {
          users && <RosterTable users={ users }/>
        }
      </Grid.Row>
    </div>
  );
}

export default Roster;
