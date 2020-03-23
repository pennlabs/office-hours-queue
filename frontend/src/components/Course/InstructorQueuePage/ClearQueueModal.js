import React, { useState, useEffect } from 'react';
import { Modal, List, Button } from 'semantic-ui-react';

const ClearQueueModal = (props) => {
  const [queue, setQueue] = useState(props.queue);
  const [open, setOpen] = useState(props.open);

  const onSubmit = () => {
    props.clearFunc();
    props.openFunc(false);
  }

  useEffect(() => {
    setQueue(props.queue)
  }, [props.queue]);

  useEffect(() => {
    setOpen(props.open)
  }, [props.open])

  return (
    <Modal open={ open }>
        <Modal.Header content="Clear Queue"/>
        <Modal.Content>
          <div>
            You are about to clear all remaining questions on: <b>{ queue.name }</b><br/>
            <br/>
            Doing so will:
            <List ordered>
              <List.Item>Reject all pending questions.</List.Item>
              <List.Item>Finish all questions currently being answered.</List.Item>
            </List>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button content="Cancel" onClick={ () => props.openFunc(false) }/>
          <Button color="red" content="Clear" onClick={ onSubmit }/>
        </Modal.Actions>
      </Modal>
  )
}

export default ClearQueueModal;