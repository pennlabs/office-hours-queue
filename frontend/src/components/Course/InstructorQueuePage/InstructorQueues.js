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

  const numActive = () => {
    return queues.reduce((count, queue) => {
      return count + (queue.archived ? 0 : 1)
    }, 0)
  };

  return (
    queues && <Grid.Row columns={2}>
      {
        queues.length !== 0 &&
        queues.map((queue) => (
          !queue.archived && <Grid.Column>
            <Queue key={ queue.id } queue={ queue } editFunc={ () => props.editFunc(queue.id) }/>
          </Grid.Column>
        ))
      }
      {
        queues && numActive() < 2 &&
        <Grid.Column>
          <Segment basic>
            <Message info>
              <Message.Header>Create a Queue</Message.Header>
              <a onClick={ props.createFunc } style={{"cursor":"pointer"}}>Create</a> a queue and augment your OHQ experience!
            </Message>
          </Segment>
        </Grid.Column>
      }
    </Grid.Row>
  );
};

export default InstructorQueues;
