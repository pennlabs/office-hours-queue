import React, {useState} from 'react';
import { Segment, Header, Grid } from 'semantic-ui-react';
import Sidebar from '../Sidebar';
import RosterTable from './RosterTable';
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

import { withAuthorization } from '../Session';
import { compose } from 'recompose';

/* GRAPHQL QUERIES/MUTATIONS */
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

const Roster = (props) => {
  /* GRAPHQL QUERIES/MUTATIONS */
  const { loading, error, data } = useQuery(GET_COURSE, { variables: {
    id: props.location.state.courseId
  }});

  console.log(props.location.state.courseId);

  /* STATE */
  const [users, setUsers] = useState([]);

  /* LOAD USERS */
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
          <Grid.Row>
            <Segment basic>
              <Header as="h1">
                { data.course.department + " " + data.course.name }
                <Header.Subheader>
                  { data.course.description }
                </Header.Subheader>
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
