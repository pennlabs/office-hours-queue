import React, { useState } from 'react';
import { Segment, Header, Grid, Table } from 'semantic-ui-react';
import RosterForm from './RosterForm';
import RemoveButton from './RemoveButton';
import ResendButton from "./ResendButton";
import InviteModal from './Invites/InviteModal';
import _ from 'lodash';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import { isLeadershipRole, prettifyRole } from "../../../utils/enums";

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
  const [toast, setToast] = useState({ open: false, success: true, message: "" });

  /* MODAL FUNCTIONS */
  const triggerModal = () => {
    setOpen(!open);
  };

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
  };

  /* GET USERS FROM DATA */
  const loadUsers = (data) => {
    return data.course.courseUsers.edges.map((item) => {
      return {
        id: item.node.id,
        fullName: item.node.user.fullName,
        preferredName: item.node.user.preferredName,
        email: item.node.user.email,
        role: item.node.kind,
      };
    });
  };

  const loadInvitedUsers = (data) => {
    return data.course.invitedCourseUsers.edges.map((item) => {
      return {
        id: item.node.id,
        email: item.node.email,
        role: item.node.kind,
        invitedBy: item.node.invitedBy,
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
  let isOnlyOneLeadership;
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
    isOnlyOneLeadership = data.course.courseUsers.edges.filter((item) => isLeadershipRole(item.node.kind)).length < 2;
  }

  /* TOAST */
  const setRosterUpdateToast = () => {
    setToast({
      open: true,
      success: true,
      message: "Roster successfully updated",
    });
  };

  const setUserRemovedToast = (name) => {
    setToast({
      open: true,
      success: true,
      message: `${name} successfully removed`,
    });
  };

  const setInviteRevokedToast = () => {
    setToast({
      open: true,
      success: true,
      message: `Invitation successfully revoked`,
    });
  };

  const setInviteResendToast = () => {
    setToast({
      open: true,
      success: true,
      message: `Invitation successfully resent`,
    });
  };

  const closeToast = () => {
    setToast({
      open: false,
      success: true,
      message: "",
    });
  };

  const onRemoveSuccess = async (name) => {
    setUserRemovedToast(name);
    await refetch();
  };

  const onRevokeSuccess = async () => {
    setInviteRevokedToast();
    await refetch();
  };

  return (
    <div>
      {
        users &&
        <InviteModal open={ open }
          closeFunc={ closeModal }
          courseId={ props.course.id }
          successFunc={ setRosterUpdateToast }/>
      }
      <Grid.Row>
      {
        users &&
        <Segment basic>
          <RosterForm
            showShowInvitedButton={ invitedUsers.length > 0 }
            showInviteButton={ isLeadershipRole(props.courseUserKind) }
            invitedShown={ showInvited }
            filterFunc={ filterUsers }
            inviteFunc={ triggerModal }
            showInvitedFunc={ () => { setShowInvited(!showInvited) } }/>
        </Segment>
      }
      </Grid.Row>
      <Grid.Row>
      {
        (showInvited && invitedUsers.length > 0) &&
        <Segment basic>
          <Grid.Row>
            <Header as="h3">
              Invited Users
            </Header>
         </Grid.Row>
        <Table sortable celled padded selectable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width={3}>Email</Table.HeaderCell>
              <Table.HeaderCell width={2}>Role</Table.HeaderCell>
              <Table.HeaderCell width={3}>Invited By</Table.HeaderCell>
              {
                isLeadershipRole(props.courseUserKind) && [
                  <Table.HeaderCell width={1}>Resend</Table.HeaderCell>,
                  <Table.HeaderCell width={1}>Revoke</Table.HeaderCell>,
                ]
              }
            </Table.Row>
          </Table.Header>
          <Table.Body>
          {
            invitedUsers.map((user) => (
              <Table.Row>
                <Table.Cell>{ user.email }</Table.Cell>
                <Table.Cell>{ prettifyRole(user.role) }</Table.Cell>
                <Table.Cell>{ user.invitedBy.preferredName }</Table.Cell>
                {
                  isLeadershipRole(props.courseUserKind) && [
                    <Table.Cell textAlign="center">
                      <ResendButton id={user.id} successFunc={setInviteResendToast}/>
                    </Table.Cell>,
                    <Table.Cell textAlign="center">
                      <RemoveButton id={user.id} isInvited={true} successFunc={onRevokeSuccess}/>
                    </Table.Cell>,
                  ]
                }
              </Table.Row>
            ))
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
          <Table sortable celled padded selectable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell
                  sorted={tableState.column === 'fullName' ? tableState.direction : null}
                  onClick={() => handleSort('fullName')}
                  width={3}>Full Name
                </Table.HeaderCell>
                <Table.HeaderCell
                  sorted={tableState.column === 'preferredName' ? tableState.direction : null}
                  onClick={() => handleSort('preferredName')}
                  width={3}>Preferred Name
                </Table.HeaderCell>
                <Table.HeaderCell
                  sorted={tableState.column === 'email' ? tableState.direction : null}
                  onClick={() => handleSort('email')}
                  width={4}>Email
                </Table.HeaderCell>
                <Table.HeaderCell
                  sorted = {tableState.column === 'role' ? tableState.direction : null}
                  onClick = {() => handleSort('role')}
                  width={2}>Role
                </Table.HeaderCell>
                {
                  isLeadershipRole(props.courseUserKind) &&
                  <Table.HeaderCell width={1}>Remove</Table.HeaderCell>
                }
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {
                filteredUsers.map((user) => (
                  <Table.Row key={user.id}>
                    <Table.Cell>{ user.fullName }</Table.Cell>
                    <Table.Cell>{ user.preferredName }</Table.Cell>
                    <Table.Cell>{ user.email }</Table.Cell>
                    <Table.Cell>{ prettifyRole(user.role) }</Table.Cell>
                    {
                      isLeadershipRole(props.courseUserKind) &&
                      <Table.Cell textAlign="center">
                        <RemoveButton
                          disabled={ isOnlyOneLeadership && isLeadershipRole(user.role) }
                          id={ user.id }
                          userName={ user.fullName }
                          isInvited={ false }
                          successFunc={ onRemoveSuccess }/>
                      </Table.Cell>
                    }
                  </Table.Row>
                ))
              }
            </Table.Body>
          </Table>
        </Segment>
      }
      </Grid.Row>
      <Snackbar
        open={ toast.open }
        autoHideDuration={6000}
        onClose={ closeToast }
      >
        <Alert severity={ toast.success ? 'success' : 'error' } onClose={ closeToast }>
          <span>{ toast.message }</span>
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Roster;
