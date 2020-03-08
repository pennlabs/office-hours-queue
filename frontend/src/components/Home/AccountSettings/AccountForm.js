import React, { useState } from 'react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import { Form, Button } from 'semantic-ui-react';

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
  const [updateUser, { data, loading }] = useMutation(UPDATE_USER);

  /* STATE */
  const [defUser, setDefUser] = useState({
    email: props.user.email,
    fullName: props.user.fullName,
    preferredName: props.user.preferredName,
    phoneNumber: props.user.phoneNumber
  });
  const [input, setInput] = useState({});
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e, { name, value }) => {
    input[name] = value;
    setInput(input);
  };

  const onSubmit = async () => {
    const fullName = input.fullName ? input.fullName : defUser.fullName;
    const preferredName = input.preferredName ? input.preferredName : defUser.preferredName;
    const phoneNumber = input.phoneNumber ? input.phoneNumber : defUser.phoneNumber;

    const newInput = (phoneNumber ?
      {
        fullName: fullName,
        preferredName: preferredName,
        phoneNumber: phoneNumber
      } : {
        fullName: fullName,
        preferredName: preferredName
      }
    );

    await updateUser({
      variables: {
        input: newInput
      }
    })
    await props.refetch();
    setSuccess(true);
  };

  return (
    <Form>
      <Form.Field>
        <label>Email Address</label>
        <Form.Input
          defaultValue={ defUser.email }
          disabled
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Full Name</label>
        <Form.Input
          placeholder='Full Name'
          defaultValue={ defUser.fullName }
          name='fullName'
          disabled={ loading }
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
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
      <Button type='submit' disabled={ loading }  onClick={ onSubmit }>Submit</Button>
      {
        !loading && success && <span>Updated!</span>
      }
      {
        loading && <span>Updating...</span>
      }
    </Form>
  );
};

export default AccountForm;
