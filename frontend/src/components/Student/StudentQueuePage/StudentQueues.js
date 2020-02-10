import React, { useState, useEffect } from 'react';
import { Segment, Grid, Message } from 'semantic-ui-react';
import StudentQueue from './StudentQueue';

const StudentQueues = (props) => {
  const [queues, setQueues] = useState(props.queues);

  useEffect(() => {
    setQueues(props.queues);
  }, [props.queues]);
  
  return (
    queues && <Grid.Row columns={queues.length}>
    {
      queues.length != 0 ?
        queues.map((queue, index) => (
          <Grid.Column>
            <StudentQueue queue={ queue } refetch={ props.refetch }/>
          </Grid.Column>
        )) :
        <Grid.Column>
          <Segment basic>
          <Message info>
            <Message.Header>No Queues</Message.Header>
            This course currently has no queues!
          </Message>
          </Segment>
        </Grid.Column>        
    }
    </Grid.Row>
  );
}

export default StudentQueues;