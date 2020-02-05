import React from 'react';
import { Segment, Menu, Grid, Header } from 'semantic-ui-react';
import { withFirebase } from '../Firebase';
import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';
import { gql } from 'apollo-boost';
import { useQuery, useMutation } from '@apollo/react-hooks';

const SubSidebar = (props) => {

  console.log(props.courseId);

  /* PATHS */
  const queuePath = {
    pathname: ROUTES.QUEUE,
    state: { courseId: props.courseId }
  }
  const rosterPath = {
    pathname: ROUTES.ROSTER,
    state: { courseId: props.courseId }
  }
  const analyticsPath = {
    pathname: ROUTES.ANALYTICS,
    state: { courseId: props.courseId }
  }
  const settingsPath = {
    pathname: ROUTES.COURSESETTINGS,
    state: { courseId: props.courseId }
  }

  return (
    <Grid.Column width={3}>
      <Segment basic>
        <Header as="h2" style={{"marginTop":"20px"}}>
          CIS 121
        </Header>
        <Menu vertical secondary fluid>
          <Link to={ queuePath }>
            <Menu.Item
              name="Queue"
              icon='hourglass one'
              active={props.active === 'queue'}
              color={'blue'}
            />
          </Link>
          <Link to={ rosterPath }>
            <Menu.Item
              name="Roster"
              icon='users'
              active={props.active === 'roster'}
              color={'blue'}
            />
          </Link>
          <Link to={ analyticsPath }>
            <Menu.Item
              name="Analytics"
              icon='chart bar'
              active={props.active === 'analytics'}
              color={'blue'}
            />
          </Link>
          <Link to={ settingsPath }>
            <Menu.Item
              name="Course Settings"
              icon='settings'
              active={props.active === 'course_settings'}
              color={'blue'}
            />
          </Link>
        </Menu>
      </Segment>
    </Grid.Column>
  );
};

export default withFirebase(SubSidebar);