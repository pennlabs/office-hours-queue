import React, { useState, useEffect } from 'react';
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
            id
            course {
              id
              department
              courseCode
              courseTitle
              description
              semester
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
  const [courses,  setCourses] = useState(null);
  const [user, setUser] = useState(null);

  /* LOAD DATA FUNCTIONS */
  const loadCourses = (data) => {
    if (!data) return;
    return data.currentUser.courseUsers.edges.map((courseUser) => {
      return {
        courseUserId: courseUser.node.id,
        id: courseUser.node.course.id,
        department: courseUser.node.course.department,
        courseCode: courseUser.node.course.courseCode,
        courseTitle: courseUser.node.course.courseTitle,
        description: courseUser.node.course.description,
        semester: courseUser.node.course.semester,
        year: courseUser.node.course.year,
        archived: courseUser.node.course.archived,
        kind: courseUser.node.kind
      };
    });
  };

  const loadUser = (data) => {
    if (!data) return;
    return {
      id: data.currentUser.id,
      email: data.currentUser.email,
      fullName: data.currentUser.fullName,
      preferredName: data.currentUser.preferredName,
      phoneNumber: data.currentUser.phoneNumber
    };
  };

  /* UPDATE STATE ON QUERY */
  if (data && data.currentUser) {
    const newCourses = loadCourses(data);
    const newUser = loadUser(data);

    if (JSON.stringify(newCourses) !== JSON.stringify(courses)) {
      setCourses(newCourses);
    }

    if (JSON.stringify(newUser) !== JSON.stringify(user)) {
      setUser(newUser);
    }
  }

  useEffect(() => {
    async function fetchData() {
        await refetch();
        setCourses(loadCourses(data));
        setUser(loadUser(data));
    }
    try {
      fetchData();
    } catch (e) {
      console.log(e)
    }
  }, []);

  return (
    <Grid columns={2} divided="horizontally" style={{"width":"100%"}} stackable>
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
};

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
)(Home);
