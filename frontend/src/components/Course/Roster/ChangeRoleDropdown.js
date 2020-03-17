import React, {useState} from 'react';
import {Dropdown, Popup} from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import {staffRoleOptions} from "../../../utils/enums";

const CHANGE_COURSE_USER_KIND = gql`
  mutation ChangeCourseUserKind($input: ChangeCourseUserKindInput!) {
    changeCourseUserKind(input: $input) {
      courseUser {
        id
      }
    }
  }
`;

const ChangeRoleDropdown = (props) => {
  const [changeCourseUserKind, { loading }] = useMutation(CHANGE_COURSE_USER_KIND);
  const [input, setInput] = useState({ role: props.role });

  const handleInputChange = async (e, { name, value }) => {
    input[name] = value;
    setInput(input);
    await changeCourseUserKind({
      variables: {
        input: {
          courseUserId: props.id,
          kind: value,
        }
      }
    });
    await props.refetch();
    props.successFunc();
  };

  const dropdown = (
    <Dropdown
      selection
      name='role'
      disabled={ props.disabled || loading }
      loading={ loading }
      onChange={ handleInputChange }
      value={ input.role }
      options={ staffRoleOptions }/>
  );

  return (
    <Popup
      trigger={ <div>{ dropdown }</div> }
      disabled={ !props.disabled }
      content={ 'Cannot change only user in leadership role' }
      on={ 'hover' }
      position={ 'left center' }
    />
  );
};

export default ChangeRoleDropdown;
