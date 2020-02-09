import React, { useState } from 'react';
import { Modal, Button } from 'semantic-ui-react';
import InviteForm from './InviteForm';

const InviteModal = (props) => {
  console.log(props.courseId);
  return (
    <Modal open={ props.open }>
      <Modal.Header>Invite User</Modal.Header>
      <Modal.Content>
        <InviteForm courseId={ props.courseId }/>
      </Modal.Content>
      <Modal.Actions>
        <Button content="Done" onClick={ props.closeFunc }/>
      </Modal.Actions>
    </Modal>
  )
}

export default InviteModal;