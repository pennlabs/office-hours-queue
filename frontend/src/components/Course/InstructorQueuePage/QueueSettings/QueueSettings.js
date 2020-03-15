import React, { useState, useEffect } from 'react';
import { Grid, Segment, Header, Tab, Button } from 'semantic-ui-react';
import QueueForm from './QueueForm';
import TagForm from './TagForm';
import ScheduleForm from './ScheduleForm';
import { useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

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

const QueueSettings = (props) => {
  /* STATE */
  const [queue, setQueue] = useState(props.queue);
  const [activateQueue, activateQueueRes] = useMutation(ACTIVATE_QUEUE);
  const [deactivateQueue, deactivateQueueRes] = useMutation(DEACTIVATE_QUEUE);

  const onOpen = async () => {
    await activateQueue({
      variables: {
        input: {
          queueId: queue.id
        }
      }
    });
    props.refetch();
  }

  const onClose = async () => {
    await deactivateQueue({
      variables: {
        input: {
          queueId: queue.id
        }
      }
    });
    props.refetch();
  }

  /* PROPS UPDATE */
  useEffect(() => {
    setQueue(props.queue);
  }, [props.queue]);

  return (
    <Grid.Column>
      <Grid.Row>
        <Segment basic>
          <Header as="h3">
            <Button content="Open"
              floated="right"
              color="green"
              disabled={ queue.activeOverrideTime !== null }
              onClick={ onOpen }/>
            <Button content="Close"
              floated="right"
              color="red"
              disabled={ queue.activeOverrideTime === null }
              onClick={ onClose }/>
            Queue Settings
            <Header.Subheader>
              { queue.name }
            </Header.Subheader>
          </Header>
        </Segment>
      </Grid.Row>
      <Grid.Row>
        <Segment basic>
          <Tab menu={{ pointing: true, secondary: true }} panes={
            [{
              menuItem: "General",
              render: () => { return <QueueForm refetch={ props.refetch } queue={ queue } backFunc={ props.backFunc }/> }
            }, {
              menuItem: "Tags",
              render: () => { return <TagForm refetch={ props.refetch } queue={ queue }/>}
            }]}/>
        </Segment>
      </Grid.Row>
    </Grid.Column>
  );
};

export default QueueSettings;
