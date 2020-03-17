import React, { useState, useEffect } from 'react';
import { Segment, Label, Header, Grid, Message } from 'semantic-ui-react';
import QuestionForm from './QuestionForm';
import QuestionCard from './QuestionCard';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

const StudentQueue = (props) => {
  const [queue, setQueue] = useState(props.queue);
  const [question, setQuestion] = useState(props.question);
  const [toast, setToast] = useState({ message: "", success: true });
  const [toastOpen, setToastOpen] = useState(false);

  const updateToast = (success, error) => {
    toast.success = success !== null;
    toast.message = success ? success : errorMessage(error);
    setToast(toast);
    setToastOpen(true);
  };

  const errorMessage = (error) => {
    if (!error.message || error.message.split(",").length < 2) return "There was an error!";
    return error.message.split(":")[1];
  };

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
        content={ queue.numberActiveQuestions + ` user${queue.numberActiveQuestions === 1 ? '' : 's'} in queue` }
        color="blue"
        icon="user"/>
      {
        /*
          <Label content={ `${queue.estimatedWaitTime} mins`} color="blue" icon="clock"/>
        */
      }
      <Grid.Row>
        {
          props.hasQuestion && question &&
          <QuestionCard question={ question } queue={ queue } refetch={ props.refetch } toastFunc={ updateToast }/>
        }
        {
          !queue.activeOverrideTime && !props.hasQuestion &&
          <Message style={{"marginTop":"10px"}} info header="Queue Closed" error
            content="This queue is currently closed. Contact course staff if you think this is an error."/>
        }
        {
          queue.activeOverrideTime && !props.hasQuestion &&
          <QuestionForm queue={ queue } refetch={ props.refetch } toastFunc={ updateToast }/>
        }
        {
          queue.activeOverrideTime && props.hasQuestion && !question &&
          <Message style={{"marginTop":"10px"}} info header="Question already in queue" content="You already have asked a question in another queue"/>
        }
      </Grid.Row>
      <Snackbar open={ toastOpen } autoHideDuration={6000} onClose={ () => setToastOpen(false) }>
        <Alert severity={ toast.success ? "success" : "error"} onClose={ () => setToastOpen(false) }>
          <span>{ toast.message }</span>
        </Alert>
      </Snackbar>
    </Segment>
  );
};

export default StudentQueue;
