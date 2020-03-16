import React, {useState} from 'react';
import { Modal, Button } from 'semantic-ui-react';
import AddForm from './AddForm';
import {gql} from "apollo-boost";
import {useMutation} from "@apollo/react-hooks";

const INVITE_OR_ADD_EMAILS = gql`
  mutation InviteOrAddEmails($input: InviteOrAddEmailsInput!) {
    inviteOrAddEmails(input: $input) {
      invitedCourseUsers {
        email
      }
      addedCourseUsers {
        user {
          fullName
          email
        }
      }
      existingInvitedCourseUsers {
        email
      }
      existingCourseUsers {
        user {
          fullName
          email
        }
      }
    }
  }
`;

const InviteModal = (props) => {
  const [inviteOrAddEmails, { loading, data }] = useMutation(INVITE_OR_ADD_EMAILS);

  const [input, setInput] = useState({ emails: [], kind: null });

  const handleInputChange = (e, { name, value }) => {
    input[name] = value;
    setInput(input);
  };

  const inviteFunc = async () => {
    if (input.emails.length === 0 || input.kind === null) {
      // TODO validation
      return
    }
    await inviteOrAddEmails({
      variables: {
        input: {
          emails: input.emails,
          kind: input.kind,
          courseId: props.courseId,
        }
      }
    });
    props.closeFunc();
    props.successFunc();
  };

  return (
    <Modal open={ props.open }>
      <Modal.Header>Invite User</Modal.Header>
      <Modal.Content>
        <AddForm courseId={ props.courseId } changeFunc={ handleInputChange }/>
      </Modal.Content>
      <Modal.Actions>
        <Button
          content='Invite'
          color='blue'
          disabled={loading || input.emails.length === 0 || input.kind === null}
          loading={loading}
          onClick={ inviteFunc }/>
        <Button
          content='Cancel'
          disabled={loading}
          onClick={ props.closeFunc }/>
      </Modal.Actions>
    </Modal>
  )
};

export default InviteModal;
