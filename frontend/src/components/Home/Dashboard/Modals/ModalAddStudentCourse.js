import React from 'react';
import { Modal, Button } from 'semantic-ui-react';
import AddStudentForm from '../Forms/AddStudentForm';

export default class ModalAddStudentCourse extends React.Component {
  render() {
    return (
      <Modal open={ this.props.open }>
        <Modal.Header>Add New Course</Modal.Header>
        <Modal.Content>
          <AddStudentForm/>
        </Modal.Content>
        <Modal.Actions>
          <Button content="Done" onClick={ this.props.closeFunc }/>
        </Modal.Actions>
      </Modal>
    );
  }
}