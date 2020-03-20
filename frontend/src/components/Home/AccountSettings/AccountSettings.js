import React from 'react';
import { Segment, Header, Grid } from 'semantic-ui-react';
import AccountForm from './AccountForm';

const AccountSettings = (props) => {
  return (
    <Grid.Column width={13}>
        <Grid.Row>
          <Segment basic>
            <Header as="h2">
              Account Settings
            </Header>
          </Segment>
        </Grid.Row>
        <Grid.Row>
          <Segment basic>
            <AccountForm setActive={props.setActive} user={ props.user } refetch={ props.refetch }/>
          </Segment>
        </Grid.Row>
    </Grid.Column>
  );
};

export default AccountSettings;
