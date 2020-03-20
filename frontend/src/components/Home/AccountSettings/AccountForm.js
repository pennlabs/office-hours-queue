import React, { useState, useEffect } from 'react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import { Form, Button, Icon } from 'semantic-ui-react';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import VerificationModal from './VerificationModal';

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

  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState("Your account has been updated!");
  const [error, setError] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const isDisabled = () => {
    return (!input.preferredName || !input.fullName || (input.smsNotificationsEnabled && !input.phoneNumber)) ||
      (input.preferredName === defUser.preferredName && input.fullName === defUser.fullName &&
      input.smsNotificationsEnabled === defUser.smsNotificationsEnabled && input.phoneNumber === defUser.phoneNumber)
  }

  const handleInputChange = (e, { name, value }) => {
    input[name] = name === "smsNotificationsEnabled" ? !input[name] : value;
    setInput(input);
    setShowNumber(input.smsNotificationsEnabled);
    setDisabled(isDisabled());
  };

  const needVerification = (oldUser, newUser) => {
    return (newUser.smsNotificationsEnabled && 
      oldUser.smsNotificationsEnabled !== newUser.smsNotificationsEnabled) ||
      oldUser.phoneNumber !== newUser.phoneNumber;
  }

  const onSubmit = async () => {
    const fullName = input.fullName
    const preferredName = input.preferredName
    const phoneNumber = input.phoneNumber

    const newInput = {
      fullName: fullName,
      preferredName: preferredName,
      smsNotificationsEnabled: input.smsNotificationsEnabled,
      phoneNumber: phoneNumber
    }
    try {
      await updateUser({
        variables: {
          input: newInput
        }
      })
      await props.refetch();
      setSuccess(true);
      setDisabled(true);

      if (needVerification(defUser, input)) {
        setSmsOpen(true);
        setIsVerified(false);
      }
    } catch (e) {
      setError(true);
    }
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
  }, [props.user])

  return (
    [
      <VerificationModal open={ smsOpen }
        toastFunc={ () => { setToast("Phone number verified!"); setSuccess(true) } }
        openFunc={ setSmsOpen }
        refetch={ props.refetch }/>,
      <Form>
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
            label='Enable SMS Notifications'/>
        </Form.Field>
        {
          showNumber &&
            <Form.Field>
              <label>Cellphone Number</label>
              <Form.Input
                placeholder='Cellphone Number'
                defaultValue={ defUser.phoneNumber }
                name='phoneNumber'
                onChange={ handleInputChange }
                action={
                  <Button disabled={ isVerified } color="green" animated="fade"
                    onClick={ () => { setSmsOpen(true) }}>
                    <Button.Content visible>{ "Verify" }</Button.Content>
                    <Button.Content hidden>
                      <Icon name='shield alternate'/>
                    </Button.Content>
                  </Button>
                } disabled={ loading }/>
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
        <Snackbar open={ success } autoHideDuration={6000} onClose={ () => setSuccess(false) }>
          <Alert severity="success" onClose={ () => setSuccess(false) }>
            { toast }
          </Alert>
        </Snackbar>
        <Snackbar open={ error } autoHideDuration={6000} onClose={ () => setError(false) }>
          <Alert severity="error" onClose={ () => setError(false) }>
            <span>There was an error updating your account</span>
          </Alert>
        </Snackbar>
      </Form>
    ]
  );
};

export default AccountForm;
