import React from 'react';
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import { Form, Button } from 'semantic-ui-react';

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

const AccountForm = () => {
  const {loading, error, data} = useQuery(CURRENT_USER);
  return (
    data ?
    <Form>
      <Form.Field>
        <label>Email Address</label>
        <input defaultValue={ data.currentUser.email } disabled='true' />
      </Form.Field>
      <Form.Field>
        <label>Full Name</label>
        <input placeholder='Full Name' defaultValue={ data.currentUser.fullName } />
      </Form.Field>
      <Form.Field>
        <label>Preferred Name</label>
        <input placeholder='Preferred Name' defaultValue={ data.currentUser.preferredName } />
      </Form.Field>
      <Form.Field>
        <label>Cellphone Number</label>
        <input placeholder='Cellphone Number' defaultValue={ data.currentUser.phoneNumber }/>
      </Form.Field>
      <Button type='submit'>Submit</Button>
    </Form> : <Form></Form>
  );
}

export default AccountForm;