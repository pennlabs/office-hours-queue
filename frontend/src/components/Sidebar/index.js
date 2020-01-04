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
        name="Sample Queue"
        icon='hourglass one'
        href={ROUTES.QUEUE}
        active={route.active === 'queue'}
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
      <SignOutButton />
    </Menu>
    </Segment>
  </Grid.Column>
);

export default withFirebase(Sidebar);
