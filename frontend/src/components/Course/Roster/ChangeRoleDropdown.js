import React, {useState} from 'react';
import { Dropdown } from 'semantic-ui-react';
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
  const [changeCourseUserKind, { loading, data }] = useMutation(CHANGE_COURSE_USER_KIND);
  const [input, setInput] = useState({ role: props.role });

  const handleInputChange = (e, { name, value }) => {
    input[name] = value;
    setInput(input);
    return changeCourseUserKind({
      variables: {
        input: {
          courseUserId: props.id,
          kind: value,
        }
      }
    }).then(() => {
      props.successFunc();
    });
  };

  return (
    <Dropdown
      selection
      name="role"
      // disabled={ loading }
      loading={ loading }
      onChange={ handleInputChange }
      value={ input.role }
      options={ staffRoleOptions }/>
  );
};

export default ChangeRoleDropdown;
