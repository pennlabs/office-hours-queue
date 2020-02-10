import React from 'react';
import { Modal, Button, Tab } from 'semantic-ui-react';
import InviteForm from './InviteForm';
import AddForm from './AddForm';


const InviteModal = (props) => {
  return (
    <Modal open={ props.open }>
      <Modal.Header>Invite User</Modal.Header>
      <Modal.Content>
        <Tab menu={{ pointing: true, secondary: true }} panes={
          [{
            menuItem: "Invite",
            render: () => { return <InviteForm courseId={ props.courseId }/>}
          },{
            menuItem: "Add",
            render: () => { return <AddForm courseId={ props.courseId }/> }
          }]}/>
      </Modal.Content>
      <Modal.Actions>
        <Button content="Done" onClick={ props.closeFunc }/>
      </Modal.Actions>
    </Modal>
  )
}

export default InviteModal;