import React from 'react';
import { Modal, Form, Button, Tab } from 'semantic-ui-react';
import CreateCourseForm from './CreateCourseForm';
import AddInstructorForm from './AddInstructorForm';

export default class ModalAddInstructorCourse extends React.Component {
  render() {
    return (
      <Modal open={this.props.attrs.open}>
        <Modal.Header>Add New Instructor Course</Modal.Header>
        <Modal.Content>
          <Tab menu={{ pointing: true, secondary: true }} panes={[
            {
              menuItem: "Join",
              render: () => {
                return <AddInstructorForm/>
              }
            },
            {
              menuItem: "Create",
              render: () => {
                return <CreateCourseForm/>
              }
            }
          ]}/>
        </Modal.Content>
      </Modal>
    );
  }
}