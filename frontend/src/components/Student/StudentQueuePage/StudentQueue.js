import React, { useState, useEffect } from 'react';
import { Segment, Label, Header, Grid} from 'semantic-ui-react';
import QuestionForm from './QuestionForm';

const StudentQueue = (props) => {
  const [queue, setQueue] = useState(props.queue);
  const [question, setQuestion] = useState(props.question);
  
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
        content={ "5 users" }
        color="blue"
        icon="user"
      />
      <Label content={ queue.estimatedWaitTime + " mins"} color="blue" icon="clock"/>
      <Grid.Row padded="true">
        {
          !props.hasQuestion && <QuestionForm queue={ queue } refetch={ props.refetch }/>
        }
        {
          props.hasQuestion && !question && <div>{"you already asked a question fool"}</div>
        }
        {
          props.hasQuestion && question && <div>{question.text}</div>
        }
      </Grid.Row>
    </Segment>
  );
}

export default StudentQueue;