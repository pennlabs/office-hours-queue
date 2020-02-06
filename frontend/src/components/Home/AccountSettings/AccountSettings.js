import React from 'react';
import { Segment, Header, Grid } from 'semantic-ui-react';
import AccountForm from './AccountForm';

const AccountSettings = (props) => {
  return (
    <Grid.Column width={13}>
        <Grid.Row>
          <Segment basic>
            <Header as="h1">
              Account Settings
            </Header>
          </Segment>
        </Grid.Row>
        <Grid.Row>
          <Segment basic>
            <AccountForm user={ props.user } refetch={ props.refetch }/>
          </Segment>
        </Grid.Row>
    </Grid.Column>
  );
  }

const condition = authUser => !!authUser;

export default AccountSettings;
