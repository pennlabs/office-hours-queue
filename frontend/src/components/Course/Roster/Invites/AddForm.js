import React, { useState } from 'react';
import { Form, Message, Segment } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useQuery, useMutation } from '@apollo/react-hooks';
import {roleOptions} from '../../../../utils/enums';
import AsyncCreatableSelect from 'react-select/async-creatable';
import {isValidEmail, useImperativeQuery} from "../../../../utils";

const INVITABLE_USERS = gql`
  query InvitableUsers($searchableName_Icontains: String, $courseId: ID!) {
    invitableUsers(searchableName_Icontains: $searchableName_Icontains, courseId: $courseId) {
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

const AddForm = (props) => {

  const invitableUsers = useImperativeQuery(INVITABLE_USERS);

  const promiseOptions = async (inputValue) => {
    if (inputValue.length === 0) {
      return [];
    }
    const { data } = await invitableUsers({
      searchableName_Icontains: inputValue,
      courseId: props.courseId
    });
    return data.invitableUsers.edges.map((item) => {
      return {
        label: `${item.node.fullName} (${item.node.email})`,
        value: item.node.email,
      }
    });
  };

  const formatCreateLabel = (inputValue) => {
    return (
      <div>Invite <i><b>{ inputValue }</b></i></div>
    );
  };

  return (
    <Form>
      <Form.Field>
        <label>Name or Email</label>
        <AsyncCreatableSelect
          cacheOptions
          defaultOptions
          loadOptions={promiseOptions}
          isMulti
          placeholder={'Search...'}
          isValidNewOption={isValidEmail}
          formatCreateLabel={formatCreateLabel}
          onChange={ (items) => {
            props.changeFunc(undefined, {
              name: 'emails',
              value: items === null ? [] : items.map((item) => item.value),
            });
          }}
        />
      </Form.Field>
      <Form.Field>
        <label>Role</label>
        <Form.Dropdown
          name={'kind'}
          selection options={roleOptions}
          placeholder={'Role'}
          onChange={ props.changeFunc }
        />
      </Form.Field>
    </Form>
  )
};

export default AddForm;
