import React, { useState } from 'react';
import { Form, Message } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';

const INVITABLE_USERS = gql`
  query InvitableUsers($email_Icontains: String, $fullName_Icontains: String) {
    invitableUsers(email_Icontains: $email_Icontains, fullName_Icontains: $fullName_Icontains) {
      edges {
        node {
          id
          fullName
          email
        }
      }
    }
  }
`;

const ADD_USER = gql`
  mutation AddUserToCourse($input: AddUserToCourseInput!) {
    addUserToCourse(input: $input) {
      courseUser {
        id
      }
    }
  }
`;

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
  const [invitableUsers, invitableUsersRes] = useLazyQuery(INVITABLE_USERS);
  const [addUser, addUserRes] = useMutation(ADD_USER);
  const [inviteEmail, inviteEmailRes] = useMutation(INVITE_EMAIL);

  const [input, setInput] = useState({email: null, fullName: null, userId: null, invEmail: null });
  const [results, setResults] = useState(null);

  const handleInputChange = (e, { name, value }) => {
    input[name] = value;
    setInput(input);
  }

  const onSearch = () => {
    invitableUsers({
      variables: {
        email_Icontains: input.email,
        fullName_Icontains: input.fullName
      }
    });
  }

  const getResults = (data) => {
    var newResults = [];
    data.invitableUsers.edges.forEach((item) => {
      newResults.push({
        key: item.node.id,
        value: item.node.id,
        text: item.node.fullName + ` (${item.node.email})`
      })
    })
    return newResults;
  }

  const onSubmit = () => {
    if (input.userId) {
      addUser({
        variables: {
          input: {
            userId: input.userId,
            courseId: props.courseId,
            kind: input.role
          }
        }
      })
    }
  }

  const onInvite = () => {
    if (input.invEmail) {
      inviteEmail({
        variables: {
          input: {
          }
        }
      })
    }
  }

  const isLoading = () => {
    return (addUserRes && addUserRes.loading) || 
      (invitableUsersRes && invitableUsersRes.loading) || 
      (inviteEmail && inviteEmail.loading);
  }

  if (invitableUsersRes.data && invitableUsersRes.data.invitableUsers) {
    var newResults = getResults(invitableUsersRes.data);
    if (JSON.stringify(newResults) !== JSON.stringify(results)) {
      setResults(newResults);
    }
  }

  console.log(props.courseId);


  return (
    <Form disabled={ addUserRes && addUserRes.loading }>
      <Form.Field>
        <label>Email</label>
        <Form.Input
          name="email"
          disabled={ isLoading() }
          onChange={ handleInputChange }
        />
      </Form.Field>
      <Form.Field>
        <label>Full Name</label>
        <Form.Input
          name="fullName"
          disabled={ isLoading() }
          onChange={ handleInputChange }
        />
      </Form.Field>
      <Form.Field>
          <Form.Button content="Search" disabled={ isLoading() } onClick={ onSearch }/>
      </Form.Field>
      {
        results && results.length > 0 &&
        <div>
          <Form.Field>
            <label>Results</label>
            <Form.Dropdown
              placeholder="Select User"
              name="userId"
              options={ results }
              search selection
              disabled={ isLoading() }
              onChange={ handleInputChange }/>
          </Form.Field>
          <Form.Field>
            <Form.Dropdown selection
              placeholder="Add As..."
              name="role" 
              disabled={ isLoading() }
              onChange={ handleInputChange }
              options={ roleOptions }/>
          </Form.Field>
          <Form.Field>
            <Form.Button
              content="Add" color="blue"
              disabled={ isLoading() }
              onClick={ onSubmit }/>
          </Form.Field>
        </div>
      }
      {
        results && results.length == 0 &&
        <div>
          <Message header="No Results" negative
            content="Those inputs did not return any results, but you can invite someone by email below!"/>
          <Form.Field>
            <label>Email</label> 
            <Form.Input
              name="invEmail"
              disabled={ isLoading() }
              onChange={ handleInputChange }
            />
          </Form.Field>
          <Form.Field>
            <Form.Button
              content="Invite" color="blue"
              disabled={ isLoading() }
              onClick={ onInvite }/>
          </Form.Field>
        </div>
      }
    </Form>
  )
}

export default InviteForm;