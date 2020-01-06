import React from 'react';
import { Segment, Menu, Grid, Image } from 'semantic-ui-react';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

import SignOutButton from '../SignOut';

const Sidebar = route => (
  <Grid.Column width={3}>
    <Segment basic>
    <Image src='../../../ohq.png' size='tiny'/>
    <Menu vertical secondary fluid>
      <Menu.Item
        name="Dashboard"
        icon='dashboard'
        href={ROUTES.DASHBOARD}
        active={route.active === 'dashboard'}
        color={'blue'}
      />
      <Menu.Item
        name="Sample Instructor Queue"
        icon='hourglass one'
        href={ROUTES.QUEUE}
        active={route.active === 'instructor_queue'}
        color={'blue'}
      />
      <Menu.Item
        name="Sample Student Queue"
        icon='hourglass one'
        href={ROUTES.STUDENTQUEUE}
        active={route.active === 'student_queue'}
        color={'blue'}
      />
      <Menu.Item
        name="Sample Roster"
        icon='users'
        href={ROUTES.ROSTER}
        active={route.active === 'roster'}
        color={'blue'}
      />
      <Menu.Item
        name="Sample Analytics"
        icon='chart bar'
        href={ROUTES.ANALYTICS}
        active={route.active === 'analytics'}
        color={'blue'}
      />
      <Menu.Item
        name="Sample Course Settings"
        icon='settings'
        href={ROUTES.COURSESETTINGS}
        active={route.active === 'course_settings'}
        color={'blue'}
      />
      <SignOutButton />
    </Menu>
    </Segment>
  </Grid.Column>
);

export default withFirebase(Sidebar);
