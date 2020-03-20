import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard/Dashboard';
import AccountSettings from './AccountSettings/AccountSettings';
import HomeSidebar from './HomeSidebar'
import CreateUserModal from './Dashboard/Modals/CreateUserModal';
import {Dimmer, Grid, Loader, Segment} from 'semantic-ui-react';

import { withAuthorization } from '../Session';
import { compose } from 'recompose';

import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import { courseSortFunc } from "../../utils";

/* GRAPHQL QUERIES/MUTATIONS */
const CURRENT_USER = gql`
  {
    currentUser {
      id
      fullName
      preferredName
      email
      smsNotificationsEnabled
      phoneNumber
      smsVerified
      courseUsers {
        edges {
          node {
            id
            course {
              id
              prettyId
              department
              courseCode
              courseTitle
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
  const { data, refetch } = useQuery(CURRENT_USER);

  /* STATE */
  const [active, setActive] = useState(props.newUser ? 'test': 'dashboard');
  const [courses,  setCourses] = useState(null);
  const [user, setUser] = useState(null);

  /* LOAD DATA FUNCTIONS */
  const loadCourses = (data) => {
    if (!data) return;
    return data.currentUser.courseUsers.edges.map((courseUser) => {
      return {
        courseUserId: courseUser.node.id,
        id: courseUser.node.course.id,
        prettyId: courseUser.node.course.prettyId,
        department: courseUser.node.course.department,
        courseCode: courseUser.node.course.courseCode,
        courseTitle: courseUser.node.course.courseTitle,
        // description: courseUser.node.course.description,
        semester: courseUser.node.course.semester,
        year: courseUser.node.course.year,
        archived: courseUser.node.course.archived,
        kind: courseUser.node.kind
      };
    }).sort(courseSortFunc);
  };

  const loadUser = (data) => {
    if (!data) return;
    return {
      id: data.currentUser.id,
      email: data.currentUser.email,
      fullName: data.currentUser.fullName,
      preferredName: data.currentUser.preferredName,
      smsNotificationsEnabled: data.currentUser.smsNotificationsEnabled,
      phoneNumber: data.currentUser.phoneNumber,
      smsVerified: data.currentUser.smsVerified
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
        user && active === 'test' ? <CreateUserModal setActive={setActive} user={ user } refetch={ refetch }/> : 
        courses && active === 'dashboard' ? <Dashboard courses={ courses } refetch={ refetch }/> :
        user && active === 'account_settings' ? <AccountSettings setActive={setActive} user={ user } refetch={ refetch }/> :
        // <Grid.Column width={13}>
        //   <Dimmer active inverted>
        //     <Loader size='big' inverted/>
        //   </Dimmer>
        // </Grid.Column>
        <Dashboard loading={ true } courses={ [] } refetch={ refetch }/>
      }
    </Grid>
  )
};

const condition = (authUser) => {
  return authUser && authUser.hasUserObject;
};

export default compose(
  withAuthorization(condition),
)(Home);
