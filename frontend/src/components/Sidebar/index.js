import React from 'react';
import { Segment, Menu, Grid, Image } from 'semantic-ui-react';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

import SignOutButton from '../SignOut';

const Sidebar = route => (
  <Grid.Column width={3}>
    <Segment basic>
    <Image src='../../../ohq.png' size='tiny' style={{"marginTop":"10px"}}/>
    <Menu vertical secondary fluid>
      <Menu.Item
        name="Dashboard"
        icon='dashboard'
        href={ROUTES.DASHBOARD}
        active={route.active === 'dashboard'}
        color={'blue'}
      />
      <Menu.Item
        name="Account Settings"
        icon='setting'
        href={ROUTES.ACCOUNTSETTINGS}
        active={route.active === 'account_settings'}
        color={'blue'}
      />
      <SignOutButton />
    </Menu>
    </Segment>
  </Grid.Column>
);

export default withFirebase(Sidebar);
