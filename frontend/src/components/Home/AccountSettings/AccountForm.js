import React, { useState, useEffect } from 'react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import { Form, Button, Icon, Popup } from 'semantic-ui-react';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import VerificationModal from './VerificationModal';
import { Header } from 'semantic-ui-react';


/* GRAPHQL QUERIES/MUTATIONS */
const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user {
        fullName
        preferredName
        smsNotificationsEnabled
        phoneNumber
      }
    }
  }
`;

const AccountForm = (props) => {
  /* GRAPHQL QUERIES/MUTATIONS */
  const [updateUser, { loading }] = useMutation(UPDATE_USER);

  /* STATE */
  const [defUser, setDefUser] = useState({
    email: props.user.email,
    fullName: props.user.fullName,
    preferredName: props.user.preferredName,
    smsNotificationsEnabled: props.user.smsNotificationsEnabled,
    phoneNumber: props.user.phoneNumber,
    smsVerified: props.user.smsVerified
  });
  const [input, setInput] = useState({
    email: props.user.email,
    fullName: props.user.fullName,
    preferredName: props.user.preferredName,
    smsNotificationsEnabled: props.user.smsNotificationsEnabled,
    phoneNumber: props.user.phoneNumber
  });
  const [showNumber, setShowNumber] = useState(props.user.smsNotificationsEnabled);
  const [isVerified, setIsVerified] = useState(props.user.smsVerified !== false);
  const [smsOpen, setSmsOpen] = useState(false);

  const [toast, setToast] = useState({ message: "", success: true });
  const [toastOpen, setToastOpen] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const isDisabled = () => {
    return (
      !input.preferredName ||
      !input.fullName ||
      (input.smsNotificationsEnabled && !input.phoneNumber)) ||
      (input.preferredName === defUser.preferredName &&
        input.fullName === defUser.fullName &&
        input.smsNotificationsEnabled === defUser.smsNotificationsEnabled &&
        input.phoneNumber === defUser.phoneNumber)
  };

  const handleInputChange = (e, { name, value }) => {
    input[name] = name === "smsNotificationsEnabled" ? !input[name] : value;
    setInput(input);
    setShowNumber(input.smsNotificationsEnabled);
    setDisabled(isDisabled());
  };

  const onSubmit = async () => {
    const newInput = {};
    if (input.fullName !== defUser.fullName) {
      newInput.fullName = input.fullName;
    }
    if (input.preferredName !== defUser.preferredName) {
      newInput.preferredName = input.preferredName;
    }
    if (input.smsNotificationsEnabled !== defUser.smsNotificationsEnabled) {
      newInput.smsNotificationsEnabled = input.smsNotificationsEnabled;
    }
    if (input.phoneNumber !== defUser.phoneNumber && input.smsNotificationsEnabled) {
      newInput.phoneNumber = input.phoneNumber;
    }
    try {
      const result = await updateUser({
        variables: {
          input: newInput
        }
      });
      await props.refetch();
      setToast({
        success: true,
        message: "Your account was successfully updated",
      });
      setToastOpen(true);
      setDisabled(true);

      if (result.data.updateUser.user.phoneNumber !== defUser.phoneNumber) {
        setSmsOpen(true);
        setIsVerified(false);
      }
    } catch (e) {
      setToast({
        success: false,
        message: "There was an error updating your account",
      });
      setToastOpen(true);
    }
    props.setActive('dashboard');
  };

  useEffect(() => {
    setDefUser({
      email: props.user.email,
      fullName: props.user.fullName,
      preferredName: props.user.preferredName,
      smsNotificationsEnabled: props.user.smsNotificationsEnabled,
      phoneNumber: props.user.phoneNumber
    });
    setIsVerified(props.user.smsVerified !== false);
  }, [props.user]);

  return (
    [
      <VerificationModal open={ smsOpen }
        toastFunc={ (toast) => { setToast(toast); setToastOpen(true) } }
        openFunc={ setSmsOpen }
        refetch={ props.refetch }/>,
      <Form>
        { props.welcome && 
          <Header>Welcome to OHQ!</Header>
        }
        <Form.Field required>
          <label>Email Address</label>
          <Form.Input
            defaultValue={ defUser.email }
            disabled
            onChange={ handleInputChange }/>
        </Form.Field>
        <Form.Field required>
          <label>Full Name</label>
          <Form.Input
            placeholder='Full Name'
            defaultValue={ defUser.fullName }
            name='fullName'
            disabled={ loading }
            onChange={ handleInputChange }/>
        </Form.Field>
        <Form.Field required>
          <label>Preferred Name</label>
          <Form.Input
            placeholder='Preferred Name'
            defaultValue={ defUser.preferredName }
            name='preferredName'
            disabled={ loading }
            onChange={ handleInputChange }/>
        </Form.Field>
        <Form.Field>
          <Form.Checkbox
            name="smsNotificationsEnabled"
            defaultChecked={ defUser.smsNotificationsEnabled }
            onChange={ handleInputChange }
            label={[
              'Enable SMS Notifications ',
              <Popup
                trigger={ <Icon name="question circle outline"/> }
                content="Get text message alerts when you're almost up next in line!"
                position="top center"/>
            ]}/>
        </Form.Field>
        { showNumber &&
          <Form.Field>
            <label>Cell Phone Number</label>
            <Form.Input
              placeholder='9876543210'
              defaultValue={ defUser.phoneNumber }
              name='phoneNumber'
              onChange={ handleInputChange }
              action={
                !isVerified &&
                <Button
                  disabled={ isVerified }
                  color="red"
                  content="Not Verified"
                  icon="shield alternate"
                  onClick={ () => { setSmsOpen(true) }}>
                </Button>
              }
              disabled={ loading }/>
          </Form.Field>
        }
        <Button
          color='blue'
          type='submit'
          disabled={ disabled || loading }
          loading={ loading }
          onClick={ onSubmit }>
          Save
        </Button>
        <Snackbar open={ toastOpen } autoHideDuration={6000} onClose={ () => setToastOpen(false) }>
          <Alert severity={ toast.success ? "success": "error" } onClose={ () => setToastOpen(false) }>
            { toast.message }
          </Alert>
        </Snackbar>
      </Form>
    ]
  );
};

export default AccountForm;
