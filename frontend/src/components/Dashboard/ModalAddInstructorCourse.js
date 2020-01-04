import React from 'react';
import { Modal, Form, Button } from 'semantic-ui-react';

export default class ModalAddInstructorCourse extends React.Component {
  render() {
    return (
      <Modal open={this.props.attrs.open}>
        <Modal.Header>Add New Instructor Course</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>Course Code</label>
              <Form.Input name="name" onChange={this.props.funcs.changeFunc}/>
            </Form.Field>
            <Form.Field>
              <Form.Button content="Search" color="blue" onClick={this.props.funcs.searchFunc}/>
            </Form.Field>
            {
              this.props.attrs.results && this.props.attrs.results.length > 0 &&
              <Form.Field>
                <label>Results</label>
                <Form.Dropdown
                  placeholder="Select Course"
                  name="course"
                  options={this.props.attrs.results}
                  onChange={this.props.funcs.changeFunc}
                  search
                  selection/>
              </Form.Field>
            }
          </Form>
          <div style={{"marginTop":"20px"}}>
          <a
            style={{"textDecoration":"underline", "cursor":"pointer"}}
            onClick={this.props.funcs.createFunc}
          >
            Create a New Course
          </a>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button content="Cancel" compact onClick={this.props.funcs.closeFunc}/>
          <Button content="Add" color="green" compact onClick={this.props.funcs.submitFunc}/>
        </Modal.Actions>
      </Modal>
    );
  }
}
