import React, { useState, useEffect } from 'react';
import { Segment, Grid, Message, Header } from 'semantic-ui-react';
import StudentQueue from './StudentQueue';
import LastQuestionCard from './LastQuestionCard'

const StudentQueues = (props) => {
  const [queues, setQueues] = useState(props.queues);
  const [question, setQuestion] = useState(props.question);

  const showQuestion = (question) => {
    return question.state === "ACTIVE" || question.state === "STARTED";
  }

  useEffect(() => {
    setQuestion(props.question);
  }, [props.question]);


  useEffect(() => {
    setQueues(props.queues);
  }, [props.queues]);

  return (
    queues &&
    <Grid columns={queues.length} stackable>
      <Grid.Row columns={queues.length}>
        {
          queues.length !== 0 &&
            queues.map(queue => (
              <Grid.Column>
                <StudentQueue key={ queue.id }
                  queue={ queue }
                  hasQuestion={ question !== null && showQuestion(question)  }
                  question={ question && showQuestion(question) && question.queue.id === queue.id ? question : null }
                  refetch={ props.refetch }/>
              </Grid.Column>
            ))
        }
        {
          queues.length === 0 &&
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
      <Grid.Row columns={1}>
        {
          question && !showQuestion(question) &&
          <Grid.Column>
            <LastQuestionCard question={ question }/>
          </Grid.Column>
        }
      </Grid.Row>
    </Grid>
  );
};

export default StudentQueues;
