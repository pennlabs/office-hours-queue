import React from 'react';
import { Icon, Popup, Button } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

const REMOVE_USER = gql`
  mutation RemoveUser($input: RemoveUserFromCourseInput!) {
    removeUserFromCourse(input: $input) {
      success
    }
  }
`;

const RemoveIcon = (props) => {
  const [removeUser, { loading, data }] = useMutation(REMOVE_USER);

  const onSubmit = () => {
    removeUser({
      variables: {
        input: {
          courseUserId: props.id
        }
      }
    }).then((data) => {
      props.refetch();
    });
  };

  return (
    <Popup
      trigger={
        <Icon name="remove circle" loading={ loading }/>
      }
      content={<Button color='red' content='Remove' disabled={ loading }  onClick={ onSubmit }/>}
      on='click'
      position='top center'
    />
  );
};

export default RemoveIcon;
