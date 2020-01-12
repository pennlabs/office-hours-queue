import React from 'react';
import { Segment, Header, Grid, Form, Button } from 'semantic-ui-react';
import Sidebar from '../Sidebar';

import { withAuthorization } from '../Session';
import { compose } from 'recompose';

class AccountSettings extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
          user: {
            fullName: 'Steven Bursztyn',
            preferredName: 'Steven',
            email: 'bursztyn@seas.upenn.edu',
            cellphone: '7865555555',
          },
        };
      }

      render() {
        return (
          <Grid columns={2} divided="horizontally" style={{"width":"100%"}}>
            <Sidebar active={'account_settings'}/>
            <Grid.Column width={13}>
              <Grid columns={2} padded>
                <Grid.Row>
                  {/* COURSE HEADER */}
                  <Segment basic>
                    <Header as="h1">
                      Account Settings
                    </Header>
                  </Segment>
                </Grid.Row>
                <Grid.Row>
                  <Segment basic>
                    <Form>
                      <Form.Field>
                        <label>Email Address</label>
                        <input defaultValue={this.state.user.email} disabled='true' />
                      </Form.Field>
                      <Form.Field>
                        <label>Full Name</label>
                        <input placeholder='Full Name' defaultValue={this.state.user.fullName} />
                      </Form.Field>
                      <Form.Field>
                        <label>Preferred Name</label>
                        <input placeholder='Preferred Name' defaultValue={this.state.user.preferredName} />
                      </Form.Field>
                      <Form.Field>
                        <label>Cellphone Number</label>
                        <input placeholder='Cellphone Number' defaultValue={this.state.user.cellphone}/>
                      </Form.Field>
                      <Button type='submit'>Submit</Button>
                    </Form>
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
