import React, { useState } from 'react';
import { Form, Message } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useLazyQuery, useMutation } from '@apollo/react-hooks';

const INVITABLE_USERS = gql`
  query InvitableUsers($email_Icontains: String, $fullName_Icontains: String, $courseId: ID!) {
    invitableUsers(email_Icontains: $email_Icontains, fullName_Icontains: $fullName_Icontains, courseId: $courseId) {
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
];

const AddForm = (props) => {
  const [invitableUsers, invitableUsersRes] = useLazyQuery(INVITABLE_USERS);
  const [addUser, addUserRes] = useMutation(ADD_USER);
  const [inviteEmail, inviteEmailRes] = useMutation(INVITE_EMAIL);

  const [input, setInput] = useState({
    email: null,
    fullName: null,
    userId: null,
    invEmail: null,
    invRole: null,
  });
  const [results, setResults] = useState(null);

  const handleInputChange = (e, { name, value }) => {
    input[name] = value;
    setInput(input);
  };

  const onSearch = () => {
    console.log(invitableUsers({
      variables: {
        email_Icontains: input.email,
        fullName_Icontains: input.fullName,
        courseId: props.courseId
      }
    }));
  };

  const getResults = (data) => {
    return data.invitableUsers.edges.map((item) => {
      return {
        key: item.node.id,
        value: item.node.id,
        text: `${item.node.fullName} (${item.node.email})`,
      };
    });
  };

  const onSubmit = async () => {
    if (!input.userId) { return }
    await addUser({
      variables: {
        input: {
          userId: input.userId,
          courseId: props.courseId,
          kind: input.role
        }
      }
    });
  };

  const onInvite = async () => {
    if (!input.invEmail) { return }
    await inviteEmail({
      variables: {
        input: {
          courseId: props.courseId,
          email: input.invEmail,
          kind: input.invRole
        }
      }
    });
  };

  const isLoading = () => {
    return (addUserRes && addUserRes.loading) ||
      (invitableUsersRes && invitableUsersRes.loading) ||
      (inviteEmailRes && inviteEmailRes.loading);
  };

  if (invitableUsersRes.data && invitableUsersRes.data.invitableUsers) {
    const newResults = getResults(invitableUsersRes.data);
    if (JSON.stringify(newResults) !== JSON.stringify(results)) {
      setResults(newResults);
    }
  }

  return (
    <Form>
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
        results && results.length === 0 &&
        <Message header="No Results" negative
          content="Those inputs did not return any results, but you can invite someone by email instead!"/>
      }
    </Form>
  )
};

export default AddForm;
