import React, { useState } from 'react';
import { Segment, Header, Grid, Table } from 'semantic-ui-react';
import RosterForm from './RosterForm';
import RemoveIcon from './RemoveIcon';
import InviteModal from './Invites/InviteModal';
import _ from 'lodash';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

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
          id
          kind
          user {
            id
            fullName
            preferredName
            email
          }
        }
      }
    }
    invitedCourseUsers {
      edges {
        node {
          id
          email
          kind
          invitedBy {
            preferredName
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
  const [invitedUsers, setInvitedUsers] = useState(null);
  const [open, setOpen] = useState(false);
  const [tableState, setTableState] = useState({ direction: null, column: null });
  const [showInvited, setShowInvited] = useState(false);
  const [success, setSuccess] = useState(false);

  /* MODAL FUNCTIONS */
  const triggerModal = () => {
    setOpen(!open);
  }

  /* TABLE FUNCTIONS */
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

  const formatRole = (string) => {
    switch(string) {
      case 'ADMIN': return 'Admin';
      case 'PROFESSOR': return 'Professor';
      case 'HEAD_TA': return 'Head TA';
      case 'STUDENT': return 'Student';
      default: return string;
    }
  }

  /* GET USERS FROM DATA */
  const loadUsers = (data) => {
    return data.course.courseUsers.edges.map((item) => {
      return {
        id: item.node.id,
        fullName: item.node.user.fullName,
        preferredName: item.node.user.preferredName,
        email: item.node.user.email,
        role: item.node.kind
      };
    });
  };

  const loadInvitedUsers = (data) => {
    return data.course.invitedCourseUsers.edges.map((item) => {
      return {
        id: item.node.id,
        email: item.node.email,
        role: item.node.kind,
        invitedBy: item.node.invitedBy
      };
    });
  };

  /* FILTER USERS BASED ON INPUT */
  const filterUsers = (input) => {
    const newFilteredUsers = users.filter((user) => {
      return (
        user.fullName.toUpperCase().includes(input.search) ||
        user.email.toUpperCase().includes(input.search)
      ) && (!input.role || user.role === input.role);
    });
    setFilteredUsers(newFilteredUsers);
    setTableState({ direction: null, column: null })
  };

  const closeModal = async () => {
    await refetch();
    triggerModal();
  };

  /* LOAD DATA */
  if (data && data.course) {
    const newUsers = loadUsers(data);
    const newInvitedUsers = loadInvitedUsers(data);
    if (JSON.stringify(newUsers) !== JSON.stringify(users)) {
      setUsers(newUsers);
      setFilteredUsers(newUsers);
    }

    if (JSON.stringify(newInvitedUsers) !== JSON.stringify(invitedUsers)) {
      setInvitedUsers(newInvitedUsers);
    }
  }

  return (
    <div>
      {
        users &&
        <InviteModal open={ open }
          closeFunc={ closeModal }
          courseId={ props.course.id }
          successFunc={ setSuccess }/>
      }
      <Grid.Row>
      {
        users &&
        <Segment basic>
          <RosterForm showInvited={ showInvited }
            filterFunc={ filterUsers } inviteFunc={ triggerModal }
            showFunc={ () => { setShowInvited(!showInvited) } }/>
        </Segment>
      }
      </Grid.Row>
      <Grid.Row>
      {
        showInvited &&
        <Segment basic>
          <Grid.Row>
            <Header as="h3">
              Invited Users
            </Header>
         </Grid.Row>
        <Table sortable celled padded>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell
                width={3}>Email</Table.HeaderCell>
              <Table.HeaderCell
                width={2}>Role</Table.HeaderCell>
              <Table.HeaderCell
                width={3}>Invited By</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
          {
            invitedUsers.length !== 0 ? invitedUsers.map(user => (
              <Table.Row>
                <Table.Cell>{ user.email }</Table.Cell>
                <Table.Cell>{ formatRole(user.role) }</Table.Cell>
                <Table.Cell>{ user.invitedBy.preferredName }</Table.Cell>
              </Table.Row>
            )) :
            <Table.Row>
              <Table.Cell>{ "No invited users!" }</Table.Cell>
              <Table.Cell>—</Table.Cell>
              <Table.Cell>—</Table.Cell>
            </Table.Row>
          }
          </Table.Body>
        </Table>
        </Segment>
      }
      </Grid.Row>
      <Grid.Row>
      {
        users &&
        <Segment basic>
          <Grid.Row>
            <Header as="h3">
              Roster
            </Header>
         </Grid.Row>
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
                  <Table.HeaderCell
                  width={1}>Remove</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {
                filteredUsers.map(user => (
                  <Table.Row>
                    <Table.Cell>{ user.fullName }</Table.Cell>
                    <Table.Cell>{ user.preferredName }</Table.Cell>
                    <Table.Cell>{ formatRole(user.role) }</Table.Cell>
                    <Table.Cell>{ user.email }</Table.Cell>
                    <Table.Cell textAlign="center">
                      <RemoveIcon id={ user.id } refetch={ refetch }/>
                    </Table.Cell>
                  </Table.Row>
                ))
              }
            </Table.Body>
          </Table>
        </Segment>
      }
      </Grid.Row>
      <Snackbar open={ success } autoHideDuration={6000} onClose={ () => setSuccess(false) }>
        <Alert severity="success" onClose={ () => setSuccess(false) }>
          <span>Roster updated!</span>
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Roster;
