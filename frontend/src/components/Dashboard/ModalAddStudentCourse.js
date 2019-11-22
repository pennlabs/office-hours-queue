import React from 'react';
import { Modal, Form } from 'semantic-ui-react';

//modal for adding student courses (props: submit and change function, and open boolean)
export default class ModalAddStudentCourse extends React.Component {

  render() {
    return (
      <Modal open={this.props.open}>
        <Modal.Header>Add New Student Course</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.props.submitFunc}>
            <Form.Field>
              <label>Course Code</label>
              <Form.Input name="code" onChange={this.props.changeFunc}/>
            </Form.Field>
            <Form.Field>
              <label>Course Title</label>
              <Form.Input name="title" onChange={this.props.changeFunc}/>
            </Form.Field>
            <Form.Button content="Submit"/>
          </Form>
        </Modal.Content>
      </Modal>
    );
  }

}
