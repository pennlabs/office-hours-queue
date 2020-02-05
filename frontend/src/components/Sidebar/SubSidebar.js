import React from 'react';
import { Segment, Menu, Grid, Header } from 'semantic-ui-react';
import { withFirebase } from '../Firebase';

import SignOutButton from '../SignOut';

const SubSidebar = (route) => {
  return (
    <Grid.Column width={3}>
      <Segment basic>
        <Header as="h2" style={{"marginTop":"10px"}}>
          CIS 121
        </Header>
        <Menu vertical secondary fluid>
          <Menu.Item
            name="Queue"
            icon='hourglass one'
            active={route.active === 'queue'}
            color={'blue'}
          />
          <Menu.Item
            name="Roster"
            icon='users'
            active={route.active === 'roster'}
            color={'blue'}
          />
          <Menu.Item
            name="Analytics"
            icon='chart bar'
            active={route.active === 'analytics'}
            color={'blue'}
          />
          <Menu.Item
            name="Course Settings"
            icon='settings'
            active={route.active === 'course_settings'}
            color={'blue'}
          />
        </Menu>
      </Segment>
    </Grid.Column>
  );
};

export default withFirebase(SubSidebar);