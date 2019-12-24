import React from 'react';
import { Form, Segment, Modal, Button } from 'semantic-ui-react';

export default class ModalCreateCourse extends React.Component {
  render() {
    return (
      <Modal open={this.props.attrs.open}>
        <Modal.Header>Create New Course</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>Course Code</label>
              <Form.Input name="name"/>
            </Form.Field>
            <Form.Field>
              <label>Course Title</label>
              <Form.Input name="description"/>
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button content="Cancel" compact/>
          <Button content="Create" color="green" compact/>
        </Modal.Actions>
      </Modal>
    );
  }
}
