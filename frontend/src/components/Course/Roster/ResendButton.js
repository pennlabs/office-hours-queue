import React, {useState} from 'react';
import { Icon, Popup, Button } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

const RESEND_INVITE_EMAIL = gql`
  mutation ResendInviteEmail($input: ResendInviteEmailInput!) {
    resendInviteEmail(input: $input) {
      success
    }
  }
`;

const ResendButton = (props) => {
  const [resendInviteEmail, { loading, data }] = useMutation(RESEND_INVITE_EMAIL);
  const [open, setOpen] = useState(false);

  const onSubmit = () => {
    return resendInviteEmail({
      variables: {
        input: {
          invitedCourseUserId: props.id
        }
      }
    }).then(() => {
      setOpen(false);
      props.successFunc();
    });
  };

  return (
    <Popup
      trigger={
        <Icon name="send" style={{"cursor": "pointer"}} loading={ loading }/>
      }
      content={<Button color='blue' content='Resend' disabled={ loading } onClick={ onSubmit }/>}
      on='click'
      onClose={ () => {setOpen(false)} }
      onOpen={ () => {setOpen(true)} }
      open={open}
      position='top center'
    />
  );
};

export default ResendButton;
