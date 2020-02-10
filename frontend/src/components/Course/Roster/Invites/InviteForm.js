import React, { useState } from 'react';
import { Form } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

const INVITE_EMAIL = gql`
  mutation InviteEmail($input: InviteEmailInput!) {
    inviteEmail(input: $input) {
      invitedCourseUser {
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
]

const InviteForm = (props) => {
  const [inviteEmail, { loading, error }] = useMutation(INVITE_EMAIL);

  const [input, setInput] = useState({ email: null, role: null });

  const handleInputChange = (e, { name, value }) => {
    input[name] = value;
    setInput(input);
  }

  const onSubmit = () => {
    if (input.email) {
      inviteEmail({
        variables: {
          input: {
            courseId: props.courseId,
            email: input.email,
            kind: input.role
          }
        }
      });
    }
  }

  return (
    <div>
    <Form>
      <Form.Field>
        <label>Email</label> 
        <Form.Input
          name="email"
          disabled={ loading }
          onChange={ handleInputChange }
        />
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
          onClick={ onSubmit }/>
      </Form.Field>
    </Form>
    </div>
  )
}

export default InviteForm;