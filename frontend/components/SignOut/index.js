import React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import firebase from '../Firebase';

const SignOutButton = () => (
  <Menu.Item style={{whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden"}}
    name="Signout"
    active={false}
    onClick={firebase.doSignOut}>
    <Icon name="sign-out"/>
    Sign Out
  </Menu.Item>
);

export default SignOutButton;
