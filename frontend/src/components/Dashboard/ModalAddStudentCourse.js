import React from 'react';
import { Modal, Form, Button } from 'semantic-ui-react';

//modal for adding student courses (props: submit and change function, and open boolean)
export default class ModalAddStudentCourse extends React.Component {
  render() {
    return (
      <Modal open={this.props.open}>
        <Modal.Header>Add New Student Course</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>Course Code</label>
              <Form.Input name="code" onChange={this.props.changeFunc}/>
            </Form.Field>
            <Form.Field>
              <Form.Button content="Search" color="blue" onClick={this.props.searchFunc}/>
            </Form.Field>
            {
              this.props.results && this.props.results.length > 0 &&
              <Form.Field>
                <label>Results</label>
                <Form.Dropdown
                  placeholder="Select Course"
                  name="course"
                  options={this.props.results}
                  onChange={this.props.changeFunc}
                  search
                  selection/>
              </Form.Field>
            }
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button content="Cancel" compact onClick={this.props.closeFunc}/>
          <Button content="Add" color="green" compact onClick={this.props.submitFunc}/>
        </Modal.Actions>
      </Modal>
    );
  }

}
