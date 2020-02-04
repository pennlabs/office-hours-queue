import React, {useState} from 'react';
import _ from 'lodash';
import { Segment, Header, Grid } from 'semantic-ui-react';
import Sidebar from '../Sidebar';
import RosterTable from './RosterTable';
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

import { withAuthorization } from '../Session';
import { compose } from 'recompose';

const GET_COURSE = gql`
  query course($id: ID!) {
    course(id: $id) {
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

/*class Roster extends React.Component {
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

                  <RosterTable id={this.props.location.state.courseId}/>

                  </Table>
                  </Grid.Row>
              </Grid>
            </Grid.Column>
          </Grid>
        );
    }
}
*/

const Roster = (props) => {
  const { loading, error, data } = useQuery(GET_COURSE, { variables: {
    id: props.location.state.courseId
  }});

  const [users, setUsers] = useState([]);

  if (data && users.length == 0) {
    var allUsers = []
    data.course.courseUsers.edges.map(item => {
      allUsers.push({
        fullName: item.node.user.fullName,
        preferredName: item.node.user.preferredName,
        email: item.node.user.email,
        role: item.node.kind
      })
    });

    setUsers(allUsers);
  }

  return (
    data ? <Grid columns={2} divided="horizontally" style={{"width":"100%"}}>
      <Sidebar active={'roster'}/>
      <Grid.Column width={13}>
        <Grid padded>
          <Segment basic>
            <Header as="h1">
              { data.course.department + " " + data.course.name }
              <Header.Subheader>
                { data.course.description }
              </Header.Subheader>
            </Header>
          </Segment>
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
