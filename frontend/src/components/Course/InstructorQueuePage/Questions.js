import React, { useState, useEffect } from 'react';
import { Grid, Message } from 'semantic-ui-react';
import QuestionCard from './QuestionCard';

const Questions = (props) => {
  const [filteredQuestions, setFilteredQuestions] = useState(props.questions);

  useEffect(() => {
    setFilteredQuestions(props.questions);
  }, [props.questions]);

  return (
    <Grid.Row>
      {
        filteredQuestions && filteredQuestions.length !== 0 && filteredQuestions.map(question => (
          <Grid.Row>
            <QuestionCard key={ question.id } question={ question } refetch={ props.refetch }/>
          </Grid.Row>
        ))
      }
      {
        filteredQuestions && filteredQuestions.length === 0 &&
        <Grid.Row style={{"marginTop":"10px"}}>
          <Message header="Empty Queue" content="This queue currently has no questions."/>
        </Grid.Row>
      }
    </Grid.Row>
  );
};

export default Questions;
