import React from 'react';
import { Modal, Button } from 'semantic-ui-react';
import CreateCourseForm from '../Forms/CreateCourseForm';

export default class ModalAddInstructorCourse extends React.Component {
  render() {
    return (
      <Modal open={ this.props.open }>
        <Modal.Header>Create New Course</Modal.Header>
        <Modal.Content>
          <CreateCourseForm refetch={ this.props.refetch } successFunc={ this.props.successFunc }/>
        </Modal.Content>
        <Modal.Actions>
          <Button content="Done" onClick={ this.props.closeFunc }/>
        </Modal.Actions>
      </Modal>
    );
  }
}