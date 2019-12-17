import React from 'react';
import { Modal, Form, Button } from 'semantic-ui-react';

export default class ModalAddInstructorCourse extends React.Component {
  render() {
    return (
      <Modal open={this.props.open}>
        <Modal.Header>Add New Instructor Course</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>Course Code</label>
              <Form.Input name="name" onChange={this.props.changeFunc}/>
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
          <div style={{"margin-top":"20px"}}>
          <a style={{"textDecoration":"underline", "cursor":"pointer"}}>
            Create a New Course
          </a>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button content="Cancel" compact onClick={this.props.closeFunc}/>
          <Button content="Add" color="green" compact onClick={this.props.submitFunc}/>
        </Modal.Actions>
      </Modal>
    );
  }
}
