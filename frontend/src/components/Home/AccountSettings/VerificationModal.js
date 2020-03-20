import React, { useState } from 'react';
import { Modal, Button, Segment } from 'semantic-ui-react';
import ReactCodeInput from 'react-code-input';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

const SEND_SMS_VERIFICATION = gql`
  mutation SendSmsVerification($input: SendSMSVerificationInput!) {
    sendSmsVerification(input: $input) {
      success
    }
  }
`;

const VERIFY_PHONE_NUMBER = gql`
  mutation VerifyPhoneNumber($input: VerifyPhoneNumberInput!) {
    verifyPhoneNumber(input: $input) {
      success
    }
  }
`;

const VerificationModal = (props) => {
  const [sendSmsVerification, { loading: sendLoading }] = useMutation(SEND_SMS_VERIFICATION);
  const [verifyPhoneNumber, { loading: verifyLoading }] = useMutation(VERIFY_PHONE_NUMBER);

  const sendVerification = async () => {
    try {
      await sendSmsVerification({
        variables: {
          input: {}
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  const onVerify = async (value) => {
    try {
      await verifyPhoneNumber({
        variables: {
          input: {
            code: value
          }
        }
      });
      props.refetch();
      props.openFunc(false);
      props.toastFunc();
    } catch (e) {
      console.log(e);
    }
  }

  const handleInputChange = async (value) => {
    if (value.length === 6) onVerify(value);
  }

  return (
    <Modal open={ props.open }>
      <Modal.Header>Phone Number Verification</Modal.Header>
      <Modal.Content>
        <Segment textAlign="center" basic>
          <ReactCodeInput fields={6} onChange={ handleInputChange }/>
        </Segment>
        <div>Missed your verification code? <a onClick={ () => { if(!sendLoading || !verifyLoading) sendVerification() } } style={{"cursor":"pointer"}}>Resend.</a></div>
      </Modal.Content>
      <Modal.Actions>
        <Button content="Done" onClick={ () => props.openFunc(false) }/>
      </Modal.Actions>
    </Modal>
  );
};

export default VerificationModal;
