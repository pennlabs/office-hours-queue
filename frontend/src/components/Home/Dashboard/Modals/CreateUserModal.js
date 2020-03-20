import React, { useState, useEffect } from 'react';
import AccountForm from '../../AccountSettings/AccountForm';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import { Form, Button, Modal } from 'semantic-ui-react';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import { mapPropsStream } from 'recompose';

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

const CreateUserModal = (props) => {
  return (
    <Modal open={true}>
      <Modal.Content>
        <AccountForm welcome={true} setActive={props.setActive} user={props.user} refetch={props.refetch}/>
      </Modal.Content>
    </Modal>
  );
}

export default CreateUserModal;
