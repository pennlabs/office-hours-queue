import React from 'react';
import './VerificationModal.css';

import { Modal, Button } from 'semantic-ui-react';
import VerificationForm from "./VerificationForm";

const VerificationModal = (props) => {
  return (
    <Modal open={ props.open }>
      <Modal.Header>Phone Number Verification</Modal.Header>
      <Modal.Content>
        <VerificationForm {...props}/>
      </Modal.Content>
      <Modal.Actions>
        <Button content="Cancel" onClick={ () => props.openFunc(false) }/>
      </Modal.Actions>
    </Modal>
  );
};

export default VerificationModal;
