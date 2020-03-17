import React, { useState, useEffect } from 'react';
import { Grid, Message } from 'semantic-ui-react';
import _ from 'lodash';
import QuestionCard from './QuestionCard';

const Questions = (props) => {
  const [filteredQuestions, setFilteredQuestions] = useState(props.questions);
  const [active, setActive] = useState(props.active);

  useEffect(() => {
    setFilteredQuestions(props.questions);
  }, [props.questions]);

  useEffect(() => {
    setActive(props.active);
  }, [props.active])

  return (
    <Grid.Row>
      {
        filteredQuestions && filteredQuestions.length !== 0 &&
        _.sortBy(filteredQuestions, "timeAsked").map(question => (
          <Grid.Row>
            <QuestionCard key={ question.id }
              question={ question }
              refetch={ props.refetch }
              userId={ props.userId }/>
          </Grid.Row>
        ))
      }
      {
        active && filteredQuestions && filteredQuestions.length === 0 &&
        <Grid.Row style={{"marginTop":"10px"}}>
          <Message icon="folder open outline" header="Empty Queue"
            content="This queue currently has no questions, or no questions match your tag filter."/>
        </Grid.Row>
      }
      {
        !active && filteredQuestions.length === 0 &&
        <Grid.Row style={{"marginTop":"10px"}}>
          <Message icon="calendar times outline" header="Closed Queue"
            content="This queue is currently closed. You can open it by using the 'open' button above." error/>
        </Grid.Row>
      }
    </Grid.Row>
  );
};

export default Questions;
