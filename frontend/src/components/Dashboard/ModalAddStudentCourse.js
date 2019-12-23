import React from 'react';
import { Modal, Form, Button } from 'semantic-ui-react';

//modal for adding student courses (props: submit and change function, and open boolean)
export default class ModalAddStudentCourse extends React.Component {
  render() {
    return (
      <Modal open={this.props.attrs.open}>
        <Modal.Header>Add New Student Course</Modal.Header>
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
        </Modal.Content>
        <Modal.Actions>
          <Button content="Cancel" compact onClick={this.props.funcs.closeFunc}/>
          <Button content="Add" color="green" compact onClick={this.props.funcs.submitFunc}/>
        </Modal.Actions>
      </Modal>
    );
  }

}
