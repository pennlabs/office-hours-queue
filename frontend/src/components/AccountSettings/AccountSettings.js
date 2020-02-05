import React from 'react';
import { Segment, Header, Grid, Form, Button } from 'semantic-ui-react';
import Sidebar from '../Sidebar';
import AccountForm from './AccountForm';

import { withAuthorization } from '../Session';
import { compose } from 'recompose';

class AccountSettings extends React.Component{
      render() {
        return (
          <Grid columns={2} divided="horizontally" style={{"width":"100%"}}>
            <Sidebar active={'account_settings'}/>
            <Grid.Column width={13}>
              <Grid columns={2} padded>
                <Grid.Row>
                  <Segment basic>
                    <Header as="h1">
                      Account Settings
                    </Header>
                  </Segment>
                </Grid.Row>
                <Grid.Row>
                  <Segment basic>
                    <AccountForm/>
                  </Segment>
                </Grid.Row>
              </Grid>
            </Grid.Column>
          </Grid>
        );
      }

}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
)(AccountSettings);
