import React from 'react';
import { Segment, Menu, Grid, Image } from 'semantic-ui-react';
import { withFirebase } from '../../Firebase';

import SignOutButton from '../../SignOut';

const Sidebar = (props) => (
  <Grid.Column width={3}>
    <Segment basic>
    <Image src='../../../ohq.png' size='tiny' style={{"marginTop":"10px"}}/>
    <Menu vertical secondary fluid>
      <Menu.Item
        name="Dashboard"
        icon='dashboard'
        active={ props.active === 'dashboard' }
        color='blue'
        onClick={ () => props.clickFunc('dashboard') }/>
      <Menu.Item
        name="Account Settings"
        icon='setting'
        active={ props.active === 'account_settings' }
        color='blue'
        onClick={ () => props.clickFunc('account_settings') }/>
      <SignOutButton />
    </Menu>
    </Segment>
  </Grid.Column>
);

export default withFirebase(Sidebar);
