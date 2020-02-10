import React, { useState } from 'react';
import { Header, Label, Grid, Segment, Form } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import Questions from './Questions';
import QueueFilterForm from './QueueFilterForm';

const GET_QUESTIONS = gql`
  query GetQuestions($id: ID!) {
    queue(id: $id) {
      id
      tags
      questions {
        edges {
          node {
            id
            text
            tags
            timeAsked
            askedBy {
              id
              preferredName
            }
          }
        }
      }
    }
  }
`;

const Queue = (props) => {
  const { loading, error, data, refetch } = useQuery(GET_QUESTIONS, {
    variables: {
      id: props.queue.id
    }
  });

  const getQuestions = (data) => {
    var newQuestions = [];
    data && data.queue.questions.edges.map((item) => {
      newQuestions.push({
        id: item.node.id,
        text: item.node.text,
        tags: item.node.tags,
        timeAsked: item.node.timeAsked,
        askedBy: item.node.askedBy
      })
    });
    return newQuestions;
  }

  const [queue, setQueue] = useState(props.queue);
  const [questions, setQuestions] = useState();
  const [tags, setTags] = useState();
  const [filters, setFilters] = useState({ tags: [], status: null });

  if (data && data.queue) {
    var newQuestions = getQuestions(data);
    if (JSON.stringify(newQuestions) !== JSON.stringify(questions)) {
      setQuestions(newQuestions);
    }

    if (JSON.stringify(data.queue.tags) !== JSON.stringify(tags)) {
      setTags(data.queue.tags);
    }
  }

  return (
    <Segment basic>
      <Header as="h3">
        { queue.name }
        <Header.Subheader>
            { queue.description }
        </Header.Subheader>
      </Header>
      <Label
        content={ questions && questions.length + " users" }
        color="blue"
        icon="user"
      />
      <Label content="30 mins" color="blue" icon="clock"/>
      <Label as="a"
        content="Edit"
        color="grey"
        icon="cog"
        onClick={ props.editFunc }
      />
      <Grid.Row>
        <QueueFilterForm tags={ tags }/>  
      </Grid.Row>
      <Grid.Row columns={1} padded="true">
          <Questions questions={ questions }/>
      </Grid.Row>
    </Segment>
  );
}

export default Queue;