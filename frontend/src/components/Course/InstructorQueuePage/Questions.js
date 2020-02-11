import React, { useState, useEffect } from 'react';
import { Grid, Message, Segment } from 'semantic-ui-react';
import QuestionCard from './QuestionCard';

const Questions = (props) => {
  const filter = (questions, filters) => {
    var newFilteredQuestions = []
    questions.forEach((question) => {
      if (filters.tags.length === 0 || intersects(question.tags, filters.tags)) {
        console.log(!question.timeRejected)
        if (!question.timeWithdrawn) {
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

  const [questions, setQuestions] = useState(props.questions);
  const [filteredQuestions, setFilteredQuestions] = useState(filter(props.questions, props.filters));

  useEffect(() => {
    setQuestions(props.questions);
    setFilteredQuestions(props.questions, props.filters)
  }, [props.questions]);

  useEffect(() => {
    console.log(props.filters);
    setFilteredQuestions(filter(questions, props.filters));
  }, [props.filters]);

  console.log(questions);

  return (
    <Grid.Row>
      {
        questions && questions.length != 0 && filteredQuestions.map((question) => (
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