import React, { useState, useEffect } from 'react';
import { Grid } from 'semantic-ui-react';
import InstructorQueues from './InstructorQueues';
import QueueSettings from './QueueSettings/QueueSettings';
import CreateQueue from './CreateQueue/CreateQueue';

import { gql } from 'apollo-boost';
import { useQuery, useMutation } from '@apollo/react-hooks';
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";

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
          estimatedWaitTime
          numberActiveQuestions
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

const InstructorQueuePage = (props) => {
  /* GRAPHQL QUERIES/MUTATIONS */
  const { loading, error, data, refetch } = useQuery(GET_QUEUES, { variables: {
    id: props.course.id
  }});
  const [activateQueue, activateQueueRes] = useMutation(ACTIVATE_QUEUE);
  const [deactivateQueue, deactivateQueueRes] = useMutation(DEACTIVATE_QUEUE);

  /* STATE */
  const [success, setSuccess] = useState(false);
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
        activeOverrideTime: item.node.activeOverrideTime,
        estimatedWaitTime: item.node.estimatedWaitTime,
        numberActiveQuestions: item.node.numberActiveQuestions
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

  const onOpen = async (id) => {
    await activateQueue({
      variables: {
        input: {
          queueId: id
        }
      }
    });
    refetch();
  };

  const onClose = async (id) => {
    await deactivateQueue({
      variables: {
        input: {
          queueId: id
        }
      }
    });
    refetch();
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
    <Grid stackable>
      {
        active === 'queues' && data &&
        <InstructorQueues queues={ queues }
          editFunc={ onQueueSettings }
          createFunc={ () => { setActive('create') } }
          openFunc={ onOpen }
          closeFunc={ onClose }
          leader={ leader }/>
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
