import React, { useState } from 'react';
import { Form } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

const INVITE_EMAIL = gql`
  mutation InviteEmail($input: InviteEmailsInput!) {
    inviteEmail(input: $input) {
      invitedCourseUsers {
        id
      }
    }
  }
`;

const roleOptions = [
  {
    key: "PROFESSOR",
    value: "PROFESSOR",
    text: "Professor"
  },
  {
    key: "HEAD_TA",
    value: "HEAD_TA",
    text: "Head TA"
  },
  {
    key: "TA",
    value: "TA",
    text: "TA"
  },
  {
    key: "STUDENT",
    value: "STUDENT",
    text: "Student"
  }
];

const InviteForm = (props) => {
  const [inviteEmail, { loading, error }] = useMutation(INVITE_EMAIL);

  const [input, setInput] = useState({ emails: null, role: null });

  const handleInputChange = (e, { name, value }) => {
    input[name] = value;
    setInput(input);
  };

  const isValidEmail = (email) => {
    const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(email)
  }

  const onSubmit = async () => {
    if (!input.emails || !input.role) return;

    const validEmails = Array.from(new Set(
      input.emails.split(',')
        .map((email) => email.trim())
        .filter((email) => isValidEmail(email))
    ));
    if (validEmails.length === 0) return;

    await inviteEmail({
      variables: {
        input: {
          courseId: props.courseId,
          emails: validEmails,
          kind: input.role,
        }
      }
    });
    props.successFunc(true);
  };

  return (
    <div>
    <Form>
      <Form.Field>
        <label>Email(s)</label>
        <Form.Input
          name="emails"
          disabled={ loading }
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <Form.Dropdown selection
          placeholder="Add As..."
          name="role"
          disabled={ loading }
          onChange={ handleInputChange }
          options={ roleOptions }/>
      </Form.Field>
      <Form.Field>
        <Form.Button
          content="Invite" color="blue"
          disabled={ loading }
          loading={ loading }
          onClick={ onSubmit }/>
      </Form.Field>
    </Form>
    </div>
  )
};

export default InviteForm;
