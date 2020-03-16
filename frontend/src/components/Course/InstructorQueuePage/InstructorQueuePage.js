import React, { useState, useEffect } from 'react';
import { Grid } from 'semantic-ui-react';
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
          archived
          name
          description
          tags
          activeOverrideTime
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
  const [leader, setLeader] = useState(props.leader);

  /* TAG FUNCTION */
  const getTags = (queues) => {
    const newTags = [];
    const tagNames = [];
    queues.forEach((queue) => {
      queue.tags.forEach((tag) => {
        if (!tagNames.includes(tag)) {
          newTags.push({ name: tag, isActive: false });
          tagNames.push(tag);
        }
      });
    });
    return newTags;
  };

  /* QUEUE FUNCTION */
  const loadQueues = (data) => {
    return data.course.queues.edges.map((item) => {
      return {
        id: item.node.id,
        name: item.node.name,
        description: item.node.description,
        tags: item.node.tags,
        archived: item.node.archived,
        activeOverrideTime: item.node.activeOverrideTime
      };
    });
  };

  /* HANDLER FUNCTIONS */
  const onQueueSettings = (id) => {
    setActiveQueueId(id);
    setActive('settings');
  };

  const getQueue = (id) => {
    for (const queue of queues) {
      if (queue.id === id) {
        return queue
      }
    }
  };

  /* LOAD DATA */
  if (data && data.course) {
    const newQueues = loadQueues(data);
    if (JSON.stringify(newQueues) !== JSON.stringify(queues)) {
      setQueues(newQueues);
    }
  }

  useEffect(() => {
    setLeader(props.leader);
  }, [props.leader]);

  return (
    <Grid>
      {
        active === 'queues' && data &&
        <InstructorQueues queues={ queues }
          editFunc={ onQueueSettings }
          createFunc={ () => { setActive('create') } }
          courseUserKind={ props.courseUserKind }
          leader={ leader }/>
      }
      {
        active === 'settings' &&
        <Grid.Row>
          <QueueSettings queue={ getQueue(activeQueueId) } refetch={ refetch } backFunc={ setActive }/>
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
};

export default InstructorQueuePage;
