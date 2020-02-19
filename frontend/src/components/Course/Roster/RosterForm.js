import React, { useState } from 'react';
import { Form, Button } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

const INVITE_USER = gql`
  mutation AddUserToCourse($input: AddUserToCourseInput!) {
    addUserToCourse(input: $input) {
      courseUser {
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

const RosterForm = (props) => {
  const [inviteUser, { loading, data }] = useMutation(INVITE_USER);
  const [input, setInput] = useState({
    search: "",
    role: ""
  })

  const handleInputChange = (e, { name, value }) => {
    input[name] = value.toUpperCase();
    setInput(input);
    props.filterFunc(input);
  }

  return (
    <Form>
      <Form.Field>
        <Button content="Invite" color="blue" floated="right" onClick={ props.inviteFunc }/>
        <Button content={props.showInvited ? "Hide Invited" : "Show Invited"} color="grey" floated="right" onClick={ props.showFunc }/>
      </Form.Field>
      <Form.Group>
        <Form.Field>
          <Form.Dropdown selection
            clearable
            placeholder="Filter..."
            name="role" 
            onChange={ handleInputChange }
            options={ roleOptions }/>
        </Form.Field>
        <Form.Field>
          <Form.Input icon="search"
            placeholder="Search..."
            name="search"
            onChange={ handleInputChange }/>
        </Form.Field>
      </Form.Group>
    </Form>
  )
}

export default RosterForm;