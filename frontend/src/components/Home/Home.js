import React, { useState } from 'react';
import Dashboard from './Dashboard/Dashboard';
import AccountSettings from './AccountSettings/AccountSettings';
import HomeSidebar from './HomeSidebar'
import { Grid } from 'semantic-ui-react';

import { withAuthorization } from '../Session';
import { compose } from 'recompose';

import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

/* GRAPHQL QUERIES/MUTATIONS */
const CURRENT_USER = gql`
  {
    currentUser {
      id
      fullName
      preferredName
      email
      phoneNumber
      courseUsers {
        edges {
          node {
            course {
              id
              name
              department
              description
              year
              archived
            }
            kind
          }
        }
      }
    }
  }
`;

const Home = (props) => {
  /* GRAPHQL QUERIES/MUTATIONS */
  const { loading, error, data, refetch } = useQuery(CURRENT_USER);

  /* STATE */
  const [active, setActive] = useState('dashboard');
  const [courses,  setCourses] = useState([]);
  const [user, setUser] = useState({});

  /* LOAD DATA FUNCTIONS */
  const loadCourses = (data) => {
    var newCourses = [];
    data.currentUser.courseUsers.edges.map(courseUser => {
      newCourses.push({
        name: courseUser.node.course.name,
        department: courseUser.node.course.department,
        description: courseUser.node.course.description,
        id: courseUser.node.course.id,
        year: courseUser.node.course.year,
        archived: courseUser.node.course.archived,
        kind: courseUser.node.kind
      })
    });
    return newCourses;
  }

  const loadUser = (data) => {
    var newUser = {
      id: data.currentUser.id,
      email: data.currentUser.email,
      fullName: data.currentUser.fullName,
      preferredName: data.currentUser.preferredName,
      phoneNumber: data.currentUser.phoneNumber
    }
    return newUser;
  }

  /* UPDATE STATE ON QUERY */
  if (data && data.currentUser) {
    var newCourses = loadCourses(data);
    var newUser = loadUser(data);

    if (JSON.stringify(newCourses) != JSON.stringify(courses)) {
      setCourses(newCourses);
    }

    if(JSON.stringify(newUser) != JSON.stringify(user)) {
      setUser(newUser);
    }
  }

  return (
    <Grid columns={2} divided="horizontally" style={{"width":"100%"}}>
      <HomeSidebar active={ active } clickFunc={ setActive }/>
      {
        courses && active === 'dashboard' &&
        <Dashboard courses={ courses } refetch={ refetch }/>
      }
      {
        user && active === 'account_settings' &&
        <AccountSettings user={ user } refetch={ refetch }/>
      }
    </Grid>
  )
}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
)(Home);