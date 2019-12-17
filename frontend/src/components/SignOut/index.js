import React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { withFirebase } from '../Firebase';

const SignOutButton = ({ firebase }) => (
  <Menu.Item
    name="Signout"
    active={false}
    onClick={firebase.doSignOut}>
    <Icon name="sign-out"/>
    Sign Out
  </Menu.Item>
);

export default withFirebase(SignOutButton);
