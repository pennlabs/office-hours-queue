import React, { useRef } from 'react';
import './VerificationModal.css';

import { Segment } from 'semantic-ui-react';
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

const VerificationForm = (props) => {
  const [sendSmsVerification, { loading: sendLoading }] = useMutation(SEND_SMS_VERIFICATION);
  const [verifyPhoneNumber, { loading: verifyLoading }] = useMutation(VERIFY_PHONE_NUMBER);

  const codeInput = useRef();

  const clearInput = () => {
    if (codeInput.current.textInput[0]) {
      codeInput.current.textInput[0].focus();
    }
    codeInput.current.state.input[0] = "";
    codeInput.current.state.input[1] = "";
    codeInput.current.state.input[2] = "";
    codeInput.current.state.input[3] = "";
    codeInput.current.state.input[4] = "";
    codeInput.current.state.input[5] = "";
    codeInput.current.value = "";
  };

  const sendVerification = async () => {
    try {
      await sendSmsVerification({
        variables: {
          input: {}
        }
      });
      clearInput();
      props.toastFunc({
        success: true,
        message: "Successfully resent verification code",
      });
    } catch (e) {
      props.toastFunc({
        success: false,
        message:
          e.message.includes("wait") ? "Please wait 30 seconds before resending" :
          "An error occurred when resending",
      });
    }
  };

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
      props.toastFunc({
        success: true,
        message: "Phone number successfully verified",
      });
    } catch (e) {
      clearInput();
      props.toastFunc({
        success: false,
        message:
          e.message.includes("incorrect") ? "Verification code incorrect" :
          e.message.includes("expired") ? "Verification code expired, please resend" :
          "An error occurred when verifying",
      });
    }
  };

  const handleInputChange = async (value) => {
    if (value.length === 6) {
      await onVerify(value);
    }
  };

  return [
    <Segment textAlign="center" basic>
      <ReactCodeInput type="number" fields={6} onChange={ handleInputChange } ref={codeInput}/>
    </Segment>,
    <div>
      Missed your verification code?{' '}
      <a onClick={ () => { if (!sendLoading || !verifyLoading) return sendVerification() } }
        style={{"cursor":"pointer"}}>Resend</a>
    </div>
  ];
};

export default VerificationForm;
