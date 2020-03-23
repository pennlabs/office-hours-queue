import React, { useState } from 'react';
import { Modal, List, Button } from 'semantic-ui-react';
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";

const CLEAR_QUEUE = gql`
  mutation ClearQueue($input: ClearQueueInput!) {
    clearQueue(input: $input) {
      success
    }
  }
`;


const ClearQueueModal = (props) => {

  const [clearQueue, { loading }] = useMutation(CLEAR_QUEUE);
  const [refetchLoading, setRefetchLoading] = useState(false);

  const onSubmit = async () => {
    try {
      await clearQueue({
        variables: {
          input: {
            queueId: props.queue.id
          }
        }
      });
      await setRefetchLoading(true);
      await props.refetch();
      await setRefetchLoading(false);
      props.closeFunc();
    } catch (e) {
      console.log(e)
      await setRefetchLoading(false);
    }
  };

  return (
    <Modal open={ props.open }>
      <Modal.Header content="Clear Queue"/>
      <Modal.Content>
        <div>
          You are about to clear all remaining questions on <b>{ props.queue.name }</b>.<br/>
          <br/>
          Doing so will:
          <List ordered>
            <List.Item>Reject all pending questions.</List.Item>
            <List.Item>Finish all questions currently being answered.</List.Item>
          </List>
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button
          content="Cancel"
          disabled={ loading || refetchLoading }
          onClick={ () => props.closeFunc() }/>
        <Button
          color="red"
          content="Clear"
          disabled={ loading || refetchLoading }
          loading={ loading || refetchLoading }
          onClick={ onSubmit }/>
      </Modal.Actions>
    </Modal>
  )
};

export default ClearQueueModal;
