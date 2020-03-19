import React from 'react';
import { Form, Modal } from 'semantic-ui-react';
import AccountForm from './AccountForm';

const VerificationModal = (props) => {
  return (
    <Modal open={ props.open }>
      <Modal.Header>Phone Number Verification</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Field>
            <label>Verification Code</label>
            <Form.Input/>
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button content="Cancel"/>
        <Button content="Verify" color="green"/>
      </Modal.Actions>
    </Modal>
  );
};

export default VerificationModal;
