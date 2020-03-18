import React from 'react';
import { Segment, Menu, Grid, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import SignOutButton from '../SignOut';

const Sidebar = (props) => (
  <Grid.Column width={3}>
    <Segment basic>
    <Link to={{pathName: '/'}}>
      <Image src='../../../ohq.png' size='tiny' style={{"marginTop":"10px"}}/>
    </Link>
    <Menu vertical secondary fluid>
      <Menu.Item style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}
        name="Dashboard"
        icon='dashboard'
        active={ props.active === 'dashboard' }
        color='blue'
        onClick={ () => props.clickFunc('dashboard') }/>
      <Menu.Item style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}
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

export default Sidebar;
