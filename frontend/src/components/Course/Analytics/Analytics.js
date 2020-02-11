import React from 'react';
import _ from 'lodash';
import { Table, Segment, Menu, Header, Grid, Image } from 'semantic-ui-react';

import Chart from 'chart.js';

import { fakePeople } from '../Roster/peopledata';
import { options, options2, options3, options4 } from './mockData';

import { compose } from 'recompose';


class Analytics extends React.Component {

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
        const node = this.node;
        const node2 = this.node2;
        const node3 = this.node3;
        const node4 = this.node4;

        new Chart(node, options);
        new Chart(node2, options2);
        new Chart(node3, options3);
        new Chart(node4, options4)
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
      const { column, direction } = this.state
        return(
            <Grid.Column width={13}>
              <Grid padded>
                <Segment basic padded>
                  <Header as="h1">
                    CIS 121
                    <Header.Subheader>
                      Introduction to Data Structures and Algorithms
                    </Header.Subheader>
                  </Header>
                </Segment>
                <Grid.Row>
              <Header as="h3">Usage Trends of Queues</Header>
              <canvas
                style={{ width: 800, height: 300 }}
                ref={node => (this.node = node)}
              />
              <Header as="h3">Other Usage Trends</Header>
              <canvas
                style={{ width: 800, height: 300 }}
                ref={node2 => (this.node2 = node2)}
              />
              <Header as="h3">Questions by Type</Header>
              <canvas
              style={{ width: 800, height: 300 }}
              ref={node3 => (this.node3 = node3)}
              />
              <Header as="h3">Questions by Lecture Topic</Header>
              <canvas
              style={{ width: 800, height: 300 }}
              ref={node4 => (this.node4 = node4)}
              />

                {/* add person information */}
                <Header as="h3">Student Participation</Header>
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
                      >Email</Table.HeaderCell>
                      <Table.HeaderCell
                        sorted={column === 'email' ? direction : null}
                        onClick={this.handleSort('email')}
                      >Number of Questions Asked</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                  {this.state.people.map(person => (
                                <Table.Row>
                                <Table.Cell>{person.fullName}</Table.Cell>
                                <Table.Cell>{person.email}</Table.Cell>
                                <Table.Cell>{3}</Table.Cell>
                              </Table.Row>
                    ))}
                  </Table.Body>
                  </Table>
                  </Grid.Row>
              </Grid>
            </Grid.Column>
        );
    }
}

export default Analytics;