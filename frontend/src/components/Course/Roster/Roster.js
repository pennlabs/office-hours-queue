import React, { useState } from 'react';
import { Segment, Header, Grid, Table } from 'semantic-ui-react';
import RosterForm from './RosterForm';
import _ from 'lodash';

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
  const [filteredUsers, setFilteredUsers] = useState(null);
  const [tableState, setTableState] = useState({ direction: null, column: null })

  const handleSort = (clickedColumn) => {
    if (tableState.column !== clickedColumn) {
      setTableState({
        column: clickedColumn,
        direction: 'ascending',
      });
      setFilteredUsers(_.sortBy(filteredUsers, clickedColumn));
    } else {
      setTableState({
        column: tableState.column,
        direction: tableState.direction === 'ascending' ? 'descending' : 'ascending',
      });
      setFilteredUsers(filteredUsers.reverse());
    }
  }
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

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

  /* FILTER USERS BASED ON INPUT */
  const filterUsers = (input) => {
    var newFilteredUsers = [];
    users.map((user) => {
      if (user.fullName.toUpperCase().includes(input.search) && (!input.role || user.role === input.role)) {
        newFilteredUsers.push(user);
      }
    })
    setFilteredUsers(newFilteredUsers);
    setTableState({ direction: null, column: null })
  }

  /* LOAD DATA */
  if (data && data.course) {
    var newUsers = loadUsers(data);
    if (JSON.stringify(newUsers) !== JSON.stringify(users)) {
      setUsers(newUsers);
      setFilteredUsers(newUsers);
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
        <RosterForm filterFunc={ filterUsers }/>
      </Grid.Row>
      <Grid.Row>
      {
        users &&
        <Table sortable celled padded>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                sorted={tableState.column === 'fullName' ? tableState.direction : null}
                onClick={() => handleSort('fullName')}
                width={3}>Full Name</Table.HeaderCell>
              <Table.HeaderCell
                sorted={tableState.column === 'preferredName' ? tableState.direction : null}
                onClick={() => handleSort('preferredName')}
                width={3}>Preferred Name</Table.HeaderCell>
              <Table.HeaderCell
                sorted={tableState.column === 'role' ? tableState.direction : null}
                onClick={() => handleSort('role')}
                width={2}>Role</Table.HeaderCell>
              <Table.HeaderCell
                sorted={tableState.column === 'email' ? tableState.direction : null}
                onClick={() => handleSort('email')}
                width={4}>Email</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              filteredUsers.map(user => (
                <Table.Row>
                  <Table.Cell>{ user.fullName }</Table.Cell>
                  <Table.Cell>{ user.preferredName }</Table.Cell>
                  <Table.Cell>{ capitalizeFirstLetter(user.role) }</Table.Cell>
                  <Table.Cell>{ user.email }</Table.Cell>
                </Table.Row>
              ))
            }
          </Table.Body>
        </Table>
      }
      </Grid.Row>
    </div>
  );
}

export default Roster;
