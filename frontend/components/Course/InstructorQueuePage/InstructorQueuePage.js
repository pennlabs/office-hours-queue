import React, { useState, useEffect } from 'react';
import { Grid } from 'semantic-ui-react';
import InstructorQueues from './InstructorQueues';
import QueueSettings from './QueueSettings/QueueSettings';
import CreateQueue from './CreateQueue/CreateQueue';

import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import { queueSortFunc } from "../../../utils";

/* GRAPHQL QUERIES/MUTATIONS */
const GET_QUEUES = gql`
query GetQueues($id: ID!) {
  course(id: $id) {
    id
    queues(archived: false) {
      edges {
        node {
          id
          archived
          name
          description
          tags
          activeOverrideTime
          estimatedWaitTime
          numberActiveQuestions
        }
      }
    }
  }
}
`;

const defaultDocumentTitle = document.title;

const InstructorQueuePage = (props) => {
  /* GRAPHQL QUERIES/MUTATIONS */
  const { data, refetch } = useQuery(GET_QUEUES, {
    variables: {
      id: props.course.id
    },
    pollInterval: 5000,
    skip: !props.course.id
  });

  /* STATE */
  const [success, setSuccess] = useState(false);
  const [queues, setQueues] = useState([]);
  const [activeQueueId, setActiveQueueId] = useState(null);
  const [active, setActive] = useState('queues');
  const [leader, setLeader] = useState(props.leader);

  /* QUEUE FUNCTION */
  const loadQueues = (data) => {
    return data.course.queues.edges.map((item) => {
      return {
        id: item.node.id,
        name: item.node.name,
        description: item.node.description,
        tags: item.node.tags,
        archived: item.node.archived,
        activeOverrideTime: item.node.activeOverrideTime,
        estimatedWaitTime: item.node.estimatedWaitTime,
        numberActiveQuestions: item.node.numberActiveQuestions
      };
    }).sort(queueSortFunc);
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

    const numQuestions = newQueues.map((q) => q.numberActiveQuestions).reduce((a, b) => a + b, 0);
    document.title = numQuestions === 0 ? defaultDocumentTitle : `(${numQuestions}) ${defaultDocumentTitle}`;

    if (JSON.stringify(newQueues) !== JSON.stringify(queues)) {
      setQueues(newQueues);
    }
  }

  useEffect(() => {
    setLeader(props.leader);
  }, [props.leader]);

  return (
    <Grid stackable>
      {
        active === 'queues' && data &&
        <InstructorQueues queues={ queues }
          editFunc={ onQueueSettings }
          createFunc={ () => { setActive('create') } }
          refetch={ refetch }
          leader={ leader }
          userId={ props.userId }/>
      }
      {
        active === 'settings' &&
        <Grid.Row>
          <QueueSettings
            queue={ getQueue(activeQueueId) }
            refetch={ refetch }
            backFunc={ () => setActive('queues') }/>
        </Grid.Row>
      }
      {
        active === 'create' && data &&
        <Grid.Row>
          <CreateQueue
            courseId={ props.course.id }
            refetch={ refetch }
            successFunc={ () => setSuccess(true) }
            backFunc={ () => setActive('queues') }/>
        </Grid.Row>
      }
      <Snackbar open={ success } autoHideDuration={6000} onClose={ () => setSuccess(false) }>
        <Alert severity="success" onClose={ () => setSuccess(false) }>
          <span>Queue successfully created</span>
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default InstructorQueuePage;
