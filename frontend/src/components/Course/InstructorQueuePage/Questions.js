import React, { useState, useEffect } from 'react';
import { Grid, Message } from 'semantic-ui-react';
import QuestionCard from './QuestionCard';

const Questions = (props) => {
  const isVisible = (question) => {
    return !question.timeRejected && !question.timeWithdrawn && !question.timeAnswered;
  }

  const filter = (questions, filters) => {
    var newFilteredQuestions = []
    questions.forEach((question) => {
      if (filters.tags.length === 0 || intersects(question.tags, filters.tags)) {
        if (isVisible(question)) {
          newFilteredQuestions.push(question);
        }
      }
    });
    return newFilteredQuestions;
  }

  const intersects = (l1, l2) => {
    var count = 0;
    l1.forEach((o1) => {
      if (l2.includes(o1)) {
        count += 1;
      }
    })
    return count > 0;
  }

  const [filteredQuestions, setFilteredQuestions] = useState(filter(props.questions, props.filters));

  useEffect(() => {
    setFilteredQuestions(filter(props.questions, props.filters));
  }, [props.questions]);

  return (
    <Grid.Row>
      {
        filteredQuestions && filteredQuestions.length != 0 && filteredQuestions.map((question) => (
          <Grid.Row>
            <QuestionCard question={ question } refetch={ props.refetch }/>
          </Grid.Row>
        ))
      }
      {
        filteredQuestions && filteredQuestions.length == 0 &&
        <Grid.Row style={{"marginTop":"10px"}}>
          <Message header="Empty Queue" content="This queue currently has no questions."/>
        </Grid.Row>
      }
    </Grid.Row>
  );
}

export default Questions;