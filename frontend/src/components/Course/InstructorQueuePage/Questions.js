import React, { useState, useEffect } from 'react';
import { Grid, Message } from 'semantic-ui-react';
import QuestionCard from './QuestionCard';

const Questions = (props) => {
  const isVisible = (question) => {
    return question.state === "ACTIVE" || question.state === "STARTED";
  };

  const filter = (questions, filters) => {
    return questions.filter((question) => {
      return isSubset(question.tags, filters.tags) && isVisible(question);
    });
  };

  // Returns true if l1 is a subset of l2
  const isSubset = (l1, l2) => {
    if (l1.length === 0) { return true; }
    return l1.filter(value => l2.includes(value)).length > 0;
  };

  const [filteredQuestions, setFilteredQuestions] = useState(filter(props.questions, props.filters));

  useEffect(() => {
    setFilteredQuestions(filter(props.questions, props.filters));
  }, [props.questions]);

  return (
    <Grid.Row>
      {
        filteredQuestions && filteredQuestions.length !== 0 && filteredQuestions.map((question) => (
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
