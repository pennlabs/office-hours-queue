import React, { useState } from 'react';
import { Modal } from 'semantic-ui-react';
import NewUserForm from "../Forms/NewUserForm";
import VerificationForm from "../../AccountSettings/VerificationForm";

const NewUserModal = (props) => {
  const [modalView, setModalView] = useState('info');

  return (
    <Modal open={props.open}>
      <Modal.Content>
        { modalView === 'info' ?
          <NewUserForm
            user={props.user}
            setModalView={setModalView}
            closeFunc={ props.closeFunc }
            refetch={props.refetch}
            setToast={props.setToast}/> :
          <VerificationForm
            // setModalView={setModalView}
            toastFunc={props.setToast}
            openFunc={props.closeFunc}
            refetch={props.refetch}/>
        }
      </Modal.Content>
    </Modal>
  );
};

export default NewUserModal;
