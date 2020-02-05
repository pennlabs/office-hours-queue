import React, { useState } from 'react';
import { gql } from 'apollo-boost';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Form, Button } from 'semantic-ui-react';

/* GRAPHQL QUERIES/MUTATIONS */
const CURRENT_USER = gql`
  {
    currentUser {
      id
      fullName
      preferredName
      email
      phoneNumber
    }
  }
`;

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

const AccountForm = () => {
  /* GRAPHQL QUERIES/MUTATIONS */
  const { loading, error, data } = useQuery(CURRENT_USER);
  const [updateUser, updateData] = useMutation(UPDATE_USER);

  /* STATE */
  const [input, setInput] = useState(null);

  if (data && data.currentUser && !input) {
    setInput({ 
      fullName: data.currentUser.fullName,
      preferredName: data.currentUser.preferredName,
      phoneNumber: data.currentUser.phoneNumber
    })
  }

  const handleInputChange = (e, { name, value }) => {
    input[name] = value;
    setInput(input);
  }

  const onSubmit = () => {
    var fullName = input.fullName ? input.fullName : data.currentUser.fullName;
    var preferredName = input.preferredName ? input.preferredName : data.currentUser.preferredName;
    var phoneNumber = input.phoneNumber ? input.phoneNumber : data.currentUser.phoneNumber;

    var newInput = phoneNumber ? 
      {
        fullName: fullName,
        preferredName: preferredName,
        phoneNumber: phoneNumber
      } : {
        fullName: fullName,
        preferredName: preferredName
      }


      console.log(newInput);

    updateUser({
      variables: {
        input: newInput 
      }
    });
  }

  return (
    data ?
    <Form>
      <Form.Field>
        <label>Email Address</label>
        <Form.Input
          defaultValue={ data.currentUser.email }
          disabled
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Full Name</label>
        <Form.Input
          placeholder='Full Name'
          defaultValue={ data.currentUser.fullName }
          name='fullName' required
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Preferred Name</label>
        <Form.Input
          placeholder='Preferred Name'
          defaultValue={ data.currentUser.preferredName }
          name='preferredName' required
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Cellphone Number</label>
        <Form.Input
          placeholder='Cellphone Number'
          defaultValue={ data.currentUser.phoneNumber }
          name='phoneNumber'
          onChange={ handleInputChange }/>
      </Form.Field>
      <Button type='submit' onClick={ onSubmit }>Submit</Button>
      {
        updateData && updateData.data && <span>Updated!</span>
      }
    </Form> : <Form></Form>
     
  );
}

export default AccountForm;