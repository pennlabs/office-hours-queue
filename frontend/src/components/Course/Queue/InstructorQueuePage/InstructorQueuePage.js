import React, { useState, useEffect } from 'react';
import { Grid } from 'semantic-ui-react';
import Tags from './Tags';
import InstructorQueues from './InstructorQueues';
import QueueSettings from './QueueSettings/QueueSettings';
import CreateQueue from './CreateQueue/CreateQueue';

import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

/* GRAPHQL QUERIES/MUTATIONS */
const GET_QUEUES = gql`
query GetQueues($id: ID!) {
  course(id: $id) {
    id
    queues {
      edges {
        node {
          id
          name
          description
          tags
        }
      }
    }
  }
}
`;

const InstructorQueuePage = (props) => {
  /* GRAPHQL QUERIES/MUTATIONS */
  const { loading, error, data, refetch } = useQuery(GET_QUEUES, { variables: {
    id: props.course.id
  }});

  /* STATE */
  const [queues, setQueues] = useState([]);
  const [activeQueueId, setActiveQueueId] = useState(null);
  const [active, setActive] = useState('queues');

  /* TAG FUNCTION */
  const getTags = (queues) => {
    var newTags = [];
    var tagNames = [];
    queues.map((queue) => {
      queue.tags.map((tag) => {
        if (!tagNames.includes(tag)) {
          newTags.push({ name: tag, isActive: false });
          tagNames.push(tag);
        }
      });
    });
    return newTags;
  }

  /* QUEUE FUNCTION */
  const loadQueues = (data) => {
    var newQueues = [];
    data.course.queues.edges.map((item) => {
      newQueues.push({
        id: item.node.id,
        name: item.node.name,
        description: item.node.description,
        tags: item.node.tags
      })
    })
    return newQueues;
  }

  /* HANDLER FUNCTIONS */
  const onQueueSettings = (id) => {
    setActiveQueueId(id);
    setActive('settings');
  }

  const getQueue = (id) => {
    var newQueue = {};
    queues.map((queue) => {
      if (queue.id === id) {
        console.log(id);
        newQueue = queue;
      }
    })
    return newQueue;
  }

  /* LOAD DATA */
  if (data && data.course) {
    var newQueues = loadQueues(data);
    if (JSON.stringify(newQueues) !== JSON.stringify(queues)) {
      setQueues(newQueues);
    }
  }

  return (
    <Grid>
      {
        active === 'queues' && data &&
        <Tags tags={ getTags(queues) }/>
      }
      {
        active === 'queues' && data &&
        <InstructorQueues queues={ queues }
          editFunc={ onQueueSettings }
          createFunc={ () => { setActive('create') } }/>
      }
      {
        active === 'settings' &&
        <Grid.Row>
          <QueueSettings queue={ getQueue(activeQueueId) } refetch={ refetch }/>
        </Grid.Row>
      }
      {
        active === 'create' && data &&
        <Grid.Row>
          <CreateQueue courseId={ props.course.id } refetch={ refetch }/>
        </Grid.Row>
      }
    </Grid>
  );
}

export default InstructorQueuePage;