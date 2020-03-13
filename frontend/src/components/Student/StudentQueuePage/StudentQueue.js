import React, { useState, useEffect } from 'react';
import { Segment, Label, Header, Grid, Message } from 'semantic-ui-react';
import QuestionForm from './QuestionForm';
import QuestionCard from './QuestionCard';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

const StudentQueue = (props) => {
  const [queue, setQueue] = useState(props.queue);
  const [question, setQuestion] = useState(props.question);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setQuestion(props.question);
  }, [props.question]);

  useEffect(() => {
    setQueue(props.queue);
  }, [props.queue]);

  return (
    <Segment basic>
      <Header as="h3">
        { queue.name }
        <Header.Subheader>
            { queue.description }
        </Header.Subheader>
      </Header>
      <Label
        content={ `N/A user(s)` }
        color="blue"
        icon="user"
      />
      <Label content={ `${queue.estimatedWaitTime} mins`} color="blue" icon="clock"/>
      <Grid.Row>
        {
          !queue.activeOverrideTime &&
          <Message style={{"marginTop":"10px"}} info header="Queue Closed" error
            content="This queue is currently closed. Contact course staff if you think this is an error."/>
        }
        {
          queue.activeOverrideTime && !props.hasQuestion &&
          <QuestionForm queue={ queue } refetch={ props.refetch } successFunc={ setSuccess }/>
        }
        {
          queue.activeOverrideTime && props.hasQuestion && !question &&
          <Message style={{"marginTop":"10px"}}info header="Question In Queue" content="You already have asked a question in another queue!"/>
        }
        {
          queue.activeOverrideTime && props.hasQuestion && question &&
          <QuestionCard question={ question } queue={ queue } refetch={ props.refetch }/>
        }
      </Grid.Row>
      <Snackbar open={ success } autoHideDuration={6000} onClose={ () => setSuccess(false) }>
        <Alert severity="success" onClose={ () => setSuccess(false) }>
          <span>Question added to <b>{`${queue.name}!`}</b></span>
        </Alert>
      </Snackbar>
    </Segment>
  );
};

export default StudentQueue;
