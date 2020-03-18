import React, { useState, useEffect } from 'react';
import { Header, Label, Grid, Segment, Button } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import {useMutation, useQuery} from '@apollo/react-hooks';
import Questions from './Questions';
import QueueFilterForm from './QueueFilterForm';

const GET_QUESTIONS = gql`
  query GetQuestions($id: ID!) {
    queue(id: $id) {
      id
      tags
      queueQuestions {
        edges {
          node {
            id
            text
            tags
            state
            timeAsked
            timeStarted
            timeAnswered
            orderKey
            videoChatUrl
            askedBy {
              id
              preferredName
            }
            answeredBy {
              id
              preferredName
            }
          }
        }
      }
    }
  }
`;

const ACTIVATE_QUEUE = gql`
  mutation ManuallyActivateQueue($input: ManuallyActivateQueueInput!) {
    manuallyActivateQueue(input: $input) {
      queue {
        id
      }
    }
  }
`;

const DEACTIVATE_QUEUE = gql`
mutation ManuallyDeactivateQueue($input: ManuallyDeactivateQueueInput!) {
  manuallyDeactivateQueue(input: $input) {
    queue {
      id
    }
  }
}
`;

const Queue = (props) => {
  const { data, refetch } = useQuery(GET_QUESTIONS, {
    variables: {
      id: props.queue.id
    },
    pollInterval: 1000 + Math.random() * 500,
    skip: !props.queue.id
  });
  const [activateQueue, activateQueueRes] = useMutation(ACTIVATE_QUEUE);
  const [deactivateQueue, deactivateQueueRes] = useMutation(DEACTIVATE_QUEUE);

  const getQuestions = (data) => {
    if (!data) { return [] }
    return data.queue.queueQuestions.edges.map((item) => {
      return {
        id: item.node.id,
        orderKey: item.node.orderKey,
        text: item.node.text,
        tags: item.node.tags,
        state: item.node.state,
        timeAsked: item.node.timeAsked,
        askedBy: item.node.askedBy,
        timeStarted: item.node.timeStarted,
        timeAnswered: item.node.timeAnswered,
        answeredBy: item.node.answeredBy,
        videoChatUrl: item.node.videoChatUrl
      };
    });
  };

  const onOpen = async () => {
    await activateQueue({
      variables: {
        input: {
          queueId: props.queue.id
        }
      }
    });
    // Update UI immediately
    setActive(true);
    props.refetch();
  };

  const onClose = async () => {
    await deactivateQueue({
      variables: {
        input: {
          queueId: props.queue.id
        }
      }
    });
    // Update UI immediately
    setActive(false);
    props.refetch();
  };

  const filter = (questions, filters) => {
    return questions.filter(question => {
      return isSubset(question.tags, filters.tags);
    });
  };

  // Returns true if l1 is a subset of l2
  const isSubset = (l1, l2) => {
    if (l2.length === 0)  return true;
    return l1.filter(value => l2.includes(value)).length > 0;
  };

  const handleFilterChange = (input) => {
    setFilters(input);
    setFilteredQuestions(filter(questions, input));
  };

  /* STATE */
  const [queue, setQueue] = useState(props.queue);
  const [active, setActive] = useState(props.queue.activeOverrideTime !== null)
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [tags, setTags] = useState([]);
  const [filters, setFilters] = useState({ tags: [], status: null });

  if (data && data.queue) {
    const newQuestions = getQuestions(data);
    if (JSON.stringify(newQuestions) !== JSON.stringify(questions)) {
      setQuestions(newQuestions);
      setFilteredQuestions(filter(newQuestions, filters));
    }

    if (JSON.stringify(data.queue.tags) !== JSON.stringify(tags)) {
      setTags(data.queue.tags);
    }
  }

  useEffect(() => {
    setQueue(props.queue);
    setActive(props.queue.activeOverrideTime !== null)
  }, [props.queue]);

  const queueQuestions = filter(questions, { tags: [] });

  return (
    <Segment basic>
      <Header as="h3">
        { queue.name }
        <Header.Subheader>
            { queue.description }
        </Header.Subheader>
      </Header>
      <Grid>
        <Grid.Row columns="equal">
          <Grid.Column width={5} only="computer mobile">
            <Label
              content={ queueQuestions.length + ` user${queueQuestions.length === 1 ? '' : 's'}` }
              color="blue"
              icon="user"/>
            {
              /*
              <Label content={queue.estimatedWaitTime + " mins"} color="blue" icon="clock"/>
              */
            }
          </Grid.Column>
          <Grid.Column textAlign="right" floated="right">
            { props.leader &&
              <Button
                size="mini"
                content="Edit"
                icon="cog"
                onClick={ props.editFunc }/>
            }
            <Button
              size="mini"
              content="Close"
              color={ !active ? null : "red" }
              disabled={ !active || (deactivateQueueRes && deactivateQueueRes.loading) }
              loading={ deactivateQueueRes && deactivateQueueRes.loading  }
              onClick={ onClose }/>
            <Button size="mini"
              content="Open"
              color={ active ? null : "green" }
              disabled={ active || (activateQueueRes && activateQueueRes.loading) }
              loading={ activateQueueRes && activateQueueRes.loading }
              onClick={ onOpen }/>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      {
        tags.length > 0 &&
        <Grid.Row>
        <QueueFilterForm tags={ tags } changeFunc={ handleFilterChange }/>
        </Grid.Row>
      }
      <Grid.Row columns={1} padded="true">
          <Questions
            questions={ filteredQuestions }
            filters={ filters }
            refetch={ refetch }
            active={ active }
            userId={ props.userId }/>
      </Grid.Row>
    </Segment>
  );
};

export default Queue;
