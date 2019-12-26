import React, { Component } from 'react';
import _ from 'lodash';
import { Table, Segment, Menu, Header, Grid, Image } from 'semantic-ui-react';
import * as ROUTES from '../../constants/routes';
import Sidebar from '../Sidebar';


import { fakePeople } from './peopledata';

import { withAuthorization } from '../Session';
import { compose } from 'recompose';

class Roster extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
          people: [],
          direction: null,
          column: null
         };
      };

      componentDidMount() {
        this.setState({
          people: fakePeople
        });
      }

      handleSort = (clickedColumn) => () => {
        const { column, people, direction } = this.state

        if (column !== clickedColumn) {
          this.setState({
            column: clickedColumn,
            people: _.sortBy(people, [clickedColumn]),
            direction: 'ascending',
          })

          return
        }

        this.setState({
          people: people.reverse(),
          direction: direction === 'ascending' ? 'descending' : 'ascending',
        })
      }

    render(){
      const { column, people, direction } = this.state
        return(
            <Grid columns={2} divided="horizontally" style={{"width":"100%"}}>
            <Sidebar active={'roster'}/>
            <Grid.Column width={13}>
              <Grid padded>
                <Segment basic>
                  <Header as="h1">
                      CIS 121
                      <Header.Subheader>
                        Introduction to Data Structures and Algorithms
                      </Header.Subheader>
                  </Header>
                </Segment>
                {/* add person information */}
                <Grid.Row>
                <Table celled padded>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell
                        sorted={column === 'fullName' ? direction : null}
                        onClick={this.handleSort('fullName')}
                        width={3}
                      >
                        Full Name</Table.HeaderCell>
                      <Table.HeaderCell
                        sorted={column === 'preferredName' ? direction : null}
                        onClick={this.handleSort('preferredName')}
                        width={3}
                      >Preferred Name</Table.HeaderCell>
                      <Table.HeaderCell
                        sorted={column === 'role' ? direction : null}
                        onClick={this.handleSort('role')}
                        width={2}
                      >Role</Table.HeaderCell>
                      <Table.HeaderCell
                        sorted={column === 'email' ? direction : null}
                        onClick={this.handleSort('email')}
                        width={4}
                      >Email</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                  {this.state.people.map(person => (
                                <Table.Row>
                                <Table.Cell>{person.fullName}</Table.Cell>
                                <Table.Cell>{person.preferredName}</Table.Cell>
                                <Table.Cell>{person.role}</Table.Cell>
                                <Table.Cell>{person.email}</Table.Cell>
                              </Table.Row>
                    ))}
                  </Table.Body>
                  </Table>
                  </Grid.Row>
              </Grid>
            </Grid.Column>
          </Grid>
        );
    }
}


const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
)(Roster);
