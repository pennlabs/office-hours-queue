import React, { Component } from 'react';
import _ from 'lodash';
import { Table, Segment, Menu, Header, Grid, Image } from 'semantic-ui-react';
import * as ROUTES from '../../constants/routes';


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
            <Grid columns={2} divided="horizontally">
            <Grid.Column width={4}>
              <Segment basic>
                <Image src='../../../ohq.png' size='tiny'/>
              <Menu vertical secondary fluid>
                <Menu.Item
                  name="Dashboard"
                  icon='dashboard'
                  href={ROUTES.DASHBOARD}
                />
                <Menu.Item
                  name="Sample Queue"
                  icon='hourglass one'
                  href={ROUTES.QUEUE}
                />
                <Menu.Item
                  name="Sample Roster"
                  icon='users'
                  href={ROUTES.ROSTER}
                  active={true}
                  color={'blue'}
                  />
              </Menu>
              </Segment>
            </Grid.Column>
            <Grid.Column width={12}>
              <Grid padded>
                <Segment basic padded>
                  <Header as="h2">
                    <Header.Content>
                      Course Roster
                    </Header.Content>
                  </Header>
                </Segment>
                {/* add person information */}
                <Table celled>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell
                        sorted={column === 'fullName' ? direction : null}
                        onClick={this.handleSort('fullName')}
                      >
                        Full Name</Table.HeaderCell>
                      <Table.HeaderCell
                        sorted={column === 'preferredName' ? direction : null}
                        onClick={this.handleSort('preferredName')}
                      >Preferred Name</Table.HeaderCell>
                      <Table.HeaderCell
                        sorted={column === 'role' ? direction : null}
                        onClick={this.handleSort('role')}
                      >Role</Table.HeaderCell>
                      <Table.HeaderCell
                        sorted={column === 'email' ? direction : null}
                        onClick={this.handleSort('email')}
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
