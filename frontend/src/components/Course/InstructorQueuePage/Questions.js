import React, { useState, useEffect } from 'react';
import { Grid, Message, Segment } from 'semantic-ui-react';
import QuestionCard from './QuestionCard';

const Questions = (props) => {
  const [questions, setQuestions] = useState(props.questions);

  useEffect(() => {
    setQuestions(props.questions);
  }, [props.questions]);

  return (
    <Grid.Row>
      {
        questions && questions.length != 0 && questions.map((question) => (
          <Grid.Row>
            <QuestionCard question={ question }/>
          </Grid.Row>
        ))
      }
      {
        questions && questions.length == 0 &&
        <Grid.Row style={{"marginTop":"10px"}}>
          <Message header="Empty Queue" content="This queue currently has no questions."/>
        </Grid.Row>
      }
    </Grid.Row>
  );
}

export default Questions;