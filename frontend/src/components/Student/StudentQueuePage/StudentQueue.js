import React, { useState, useEffect } from 'react';
import { Segment, Label, Header, Grid, Message } from 'semantic-ui-react';
import QuestionForm from './QuestionForm';
import QuestionCard from './QuestionCard';

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
          props.hasQuestion && !question &&
          <Message style={{"marginTop":"10px"}}info header="Question In Queue" content="You already have asked a question in another queue!"/>
        }
        {
          props.hasQuestion && question && <QuestionCard question={ question } queue={ queue }/>
        }
      </Grid.Row>
    </Segment>
  );
};

export default StudentQueue;
