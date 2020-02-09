import React, { useState, useEffect } from 'react';
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

  const [userId, setUserId] = useState(props.id);
  const [courseId, setCourseId] = useState(props.courseId);

  const onSubmit = () => {
    removeUser({
      variables: {
        input: {
          userId: userId,
          courseId: courseId
        }
      }
    }).then(data => {
      props.refetch();
    });
  }

  useEffect(() => {
    setUserId(props.id)
    setCourseId(props.courseId);
  }, [props.id])

  return (
    <Popup
        trigger={
          <Icon name="trash alternate" loading={ loading }/>
        }
        content={<Button color='red' content='Remove' disabled={ loading }  onClick={ onSubmit }/>}
        on='click'
        position='top center'
      />
    
  );
}

export default RemoveIcon;