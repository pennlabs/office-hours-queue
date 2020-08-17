import React from 'react';
import { Segment, Grid, Message } from 'semantic-ui-react';
import StudentQueue from './StudentQueue';
import LastQuestionCard from './LastQuestionCard'

const StudentQueues = (props) => {

  const showQuestion = (question) => {
    return question.state === "ACTIVE" || question.state === "STARTED";
  };

  return (
    [
      props.queues &&
      <Grid.Row columns="equal" stackable>
        {
          props.queues.length !== 0 &&
            props.queues.map(queue => (
              <Grid.Column>
                <StudentQueue key={ queue.id }
                  queue={ queue }
                  hasQuestion={ props.question !== null && showQuestion(props.question)  }
                  question={ props.question && showQuestion(props.question) && props.question.queue.id === queue.id ? props.question : null }
                  refetch={ props.refetch }/>
              </Grid.Column>
            ))
        }
        {
          props.queues.length === 0 &&
          <Grid.Column>
            <Segment basic>
            <Message info>
              <Message.Header>No Queues</Message.Header>
              This course currently has no queues!
            </Message>
            </Segment>
          </Grid.Column>
        }
      </Grid.Row>,
      <Grid.Row columns={1}>
        {
          props.question && !showQuestion(props.question) &&
          <Grid.Column>
            <LastQuestionCard question={ props.question }/>
          </Grid.Column>
        }
      </Grid.Row>
    ]
  );
};

export default StudentQueues;
