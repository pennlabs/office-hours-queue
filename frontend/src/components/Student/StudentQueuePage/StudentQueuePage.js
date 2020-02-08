import React, { useState } from 'react';
import { Grid } from 'semantic-ui-react';
import StudentQueues from './StudentQueues';

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
          estimatedWaitTime
        }
      }
    }
  }
}
`;

const StudentQueuePage = (props) => {
  const { loading, error, data, refetch } = useQuery(GET_QUEUES, { variables: {
    id: props.course.id
  }});

  const [queues, setQueues] = useState([]);
  const [active, setActive] = useState('queues');

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

  if (data && data.course) {
    var newQueues = loadQueues(data);
    if (JSON.stringify(newQueues) !== JSON.stringify(queues)) {
      setQueues(newQueues);
    }
  }

  return (
    <Grid>
      {
        active === 'queues' &&
        <StudentQueues queues={ queues } refetch={ refetch }/>
      }
    </Grid>
  );
}

export default StudentQueuePage;