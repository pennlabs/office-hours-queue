import React, { useState } from 'react';
import { Table } from 'semantic-ui-react';
import _ from 'lodash';

const RosterTable = (props) => {
  /* STATE */
  const [tableState, setTableState] = useState({ direction: null, column: null });
  const [allUsers, setAllUsers] = useState(props.users);
  const [filteredUsers, setFilteredUsers] = useState(allUsers);

  /* TODO:
    1. add function to filter by role (then update filteredUsers state) 
    2. add function to search in "filteredUsers" variable by name (then update filteredUsers state)
  */

  /* HANDLER FUNCTIONS */
  const handleSort = (clickedColumn) => {
    if (tableState.column !== clickedColumn) {
      setTableState({
        column: clickedColumn,
        direction: 'ascending',
      });
      setFilteredUsers(
        filteredUsers.sort((a, b) => {
          return a[clickedColumn] - b[clickedColumn];
        })
      );
    } else {
      setTableState({
        column: tableState.column,
        direction: tableState.direction === 'ascending' ? 'descending' : 'ascending',
      });
      setFilteredUsers(filteredUsers.reverse());
    }
  }

  return (
    <Table sortable celled padded>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell
            sorted={tableState.column === 'fullName' ? tableState.direction : null}
            onClick={() => handleSort('fullName')}
            width={3}
          >Full Name</Table.HeaderCell>
          <Table.HeaderCell
            sorted={tableState.column === 'preferredName' ? tableState.direction : null}
            onClick={() => handleSort('preferredName')}
            width={3}
          >Preferred Name</Table.HeaderCell>
          <Table.HeaderCell
            sorted={tableState.column === 'role' ? tableState.direction : null}
            onClick={() => handleSort('role')}
            width={2}
          >Role</Table.HeaderCell>
          <Table.HeaderCell
            sorted={tableState.column === 'email' ? tableState.direction : null}
            onClick={() => handleSort('email')}
            width={4}
          >Email</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {
          filteredUsers.map(user => (
            <Table.Row>
              <Table.Cell>{ user.fullName }</Table.Cell>
              <Table.Cell>{ user.preferredName }</Table.Cell>
              <Table.Cell>{ user.role }</Table.Cell>
              <Table.Cell>{ user.email }</Table.Cell>
            </Table.Row>
          ))
        }
      </Table.Body>
    </Table>
  )
}

export default RosterTable;