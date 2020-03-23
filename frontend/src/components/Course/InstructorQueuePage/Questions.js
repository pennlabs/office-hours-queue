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

  return [
    <Grid.Column>
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
    </Grid.Column>,
    active && filteredQuestions && filteredQuestions.length === 0 &&
    <Grid>
      <Grid.Row>
        <Grid.Column>
          <Message icon="folder open outline" header="Empty Queue"
            content="This queue currently has no questions, or no questions match your tag filter."/>
        </Grid.Column>
      </Grid.Row>
    </Grid>,
    !active && filteredQuestions.length === 0 &&
    <Grid>
      <Grid.Row>
        <Grid.Column>
          <Message icon="calendar times outline" header="Closed Queue"
            content="This queue is currently closed. You can open it by using the 'open' button above." error/>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  ];
};

export default Questions;
