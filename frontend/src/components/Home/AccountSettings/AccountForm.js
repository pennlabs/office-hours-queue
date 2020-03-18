import React, { useState, useEffect } from 'react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import { Form, Button } from 'semantic-ui-react';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

/* GRAPHQL QUERIES/MUTATIONS */
const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user {
        fullName
        preferredName
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
    phoneNumber: props.user.phoneNumber
  });
  const [input, setInput] = useState({
    email: props.user.email,
    fullName: props.user.fullName,
    preferredName: props.user.preferredName,
    phoneNumber: props.user.phoneNumber
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const handleInputChange = (e, { name, value }) => {
    input[name] = value;
    setInput(input);
    setDisabled((!input.preferredName || !input.fullName) ||
      (input.preferredName === defUser.preferredName &&
       input.fullName === defUser.fullName &&
       input.phoneNumber === defUser.phoneNumber))
  };

  const onSubmit = async () => {
    const fullName = input.fullName
    const preferredName = input.preferredName
    const phoneNumber = input.phoneNumber

    const newInput = {
      fullName: fullName,
      preferredName: preferredName,
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
    } catch (e) {
      setError(true);
    }
  };

  useEffect(() => {
    setDefUser({
      email: props.user.email,
      fullName: props.user.fullName,
      preferredName: props.user.preferredName,
      phoneNumber: props.user.phoneNumber
    })
  }, [props.user])

  return (
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
        <label>Cellphone Number</label>
        <Form.Input
          placeholder='Cellphone Number'
          defaultValue={ defUser.phoneNumber }
          name='phoneNumber'
          disabled={ loading }
          onChange={ handleInputChange }/>
      </Form.Field>
      <Button
        color='blue'
        type='submit'
        disabled={ disabled || loading }
        loading={ loading }
        onClick={ onSubmit }>
        Submit
      </Button>
      <Snackbar open={ success } autoHideDuration={6000} onClose={ () => setSuccess(false) }>
        <Alert severity="success" onClose={ () => setSuccess(false) }>
          Your account has been updated!
        </Alert>
      </Snackbar>
      <Snackbar open={ error } autoHideDuration={6000} onClose={ () => setError(false) }>
        <Alert severity="error" onClose={ () => setError(false) }>
          <span>There was an error updating your account</span>
        </Alert>
      </Snackbar>
    </Form>
  );
};

export default AccountForm;
