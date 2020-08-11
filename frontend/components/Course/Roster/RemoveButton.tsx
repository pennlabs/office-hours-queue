import React, { useState } from 'react';
import { Icon, Popup, Button } from 'semantic-ui-react';
// import { gql } from 'apollo-boost';
// import { useMutation } from '@apollo/react-hooks';

// const REMOVE_USER = gql`
//   mutation RemoveUser($input: RemoveUserFromCourseInput!) {
//     removeUserFromCourse(input: $input) {
//       success
//     }
//   }
// `;

// const REMOVE_INVITED_USER = gql`
//   mutation RemoveInvitedUser($input: RemoveInvitedUserFromCourseInput!) {
//     removeInvitedUserFromCourse(input: $input) {
//       success
//     }
//   }
// `;

const RemoveButton = (props) => {
  const [removeUser, { loading }] = useMutation(props.isInvited ? REMOVE_INVITED_USER : REMOVE_USER);
  const [open, setOpen] = useState(false);

  const onSubmit = () => {
    return removeUser({
      variables: {
        input: props.isInvited ? {
          invitedCourseUserId: props.id
        } : {
            courseUserId: props.id
          }
      }
    }).then(() => {
      setOpen(false);
      props.successFunc(props.userName);
    });
  };

  const removeContent = (
    <Button
      color='red'
      content={props.isInvited ? 'Revoke' : 'Remove'}
      disabled={loading}
      onClick={onSubmit} />
  );
  const disabledContent = 'Cannot remove only user in leadership role';

  return (
    <Popup
      trigger={
        <Icon
          disabled={props.disabled || loading}
          name="remove circle"
          style={{ "cursor": "pointer" }}
          loading={loading} />
      }
      content={props.disabled ? disabledContent : removeContent}
      on={props.disabled ? 'hover' : 'click'}
      onClose={() => { setOpen(false) }}
      onOpen={() => { setOpen(true) }}
      open={open}
      position={props.disabled ? 'left center' : 'top center'}
    />
  );
};

export default RemoveButton;
