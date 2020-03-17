import React, { useState, useEffect } from 'react';
import { Grid, Segment, Header, Message } from 'semantic-ui-react';
import Queue from './Queue.js';
import { isLeadershipRole } from "../../../utils/enums";

const InstructorQueues = (props) => {
  /* STATE */
  const [queues, setQueues] = useState(props.queues);
  const [leader, setLeader] = useState(props.leader);

  const numActive = () => {
    return queues.reduce((count, queue) => {
      return count + (queue.archived ? 0 : 1)
    }, 0)
  };

  /* PROPS UPDATE */
  useEffect(() => {
    setQueues(props.queues);
  }, [props.queues]);

  useEffect(() => {
    setLeader(props.leader);
  }, [props.leader]);

  return (
    queues && <Grid.Row columns={2}>
      {
        queues.length !== 0 &&
        queues.map((queue) => (
          !queue.archived &&
          <Grid.Column key={'column' + queue.id}>
            <Queue
              key={ queue.id }
              queue={ queue }
              leader={ props.leader }
              openFunc={ () => props.openFunc(queue.id) }
              closeFunc={ () => props.closeFunc(queue.id) }
              editFunc={ () => props.editFunc(queue.id) }
              userId={ props.userId }/>
          </Grid.Column>
        ))
      }
      {
        queues && numActive() < 2 && leader &&
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
