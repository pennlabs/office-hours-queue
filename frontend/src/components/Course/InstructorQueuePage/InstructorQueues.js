import React, { useState, useEffect } from 'react';
import { Grid, Segment, Header, Message } from 'semantic-ui-react';
import Queue from './Queue.js';

const InstructorQueues = (props) => {
  /* STATE */
  const [queues, setQueues] = useState([]);

  /* PROPS UPDATE */
  useEffect(() => {
    setQueues(props.queues);
  }, [props.queues]);

  return (
    queues && <Grid.Row columns={2}>
      {
        queues.length !== 0 &&
        queues.map((queue) => (
          !queue.archived && <Grid.Column>
            <Queue queue={ queue } editFunc={ () => props.editFunc(queue.id) }/>
          </Grid.Column>
        ))
      }
      {
        queues.length < 2 &&
        <Grid.Column>
          <Segment basic>
          <Message info>
            <Message.Header>Create a Queue</Message.Header>
            <a onClick={ props.createFunc } style={{"cursor":"pointer"}}>Create</a> a queue and augment OHQ experience!
          </Message>
          </Segment>
        </Grid.Column>
      }
    </Grid.Row>
  );
};

export default InstructorQueues;
