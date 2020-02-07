import React from 'react';
import { Segment, Header, Grid } from 'semantic-ui-react';

const Summary = (props) => {
  return (
    <Grid.Column width={13}>
      <Grid.Row>
        <Segment basic>
          <Header as="h1">
            Question Summary
          </Header>
        </Segment>
      </Grid.Row>
      <Grid.Row>
        <Segment basic>
          TODO
        </Segment>
      </Grid.Row>
    </Grid.Column>
  );
}

export default Summary;