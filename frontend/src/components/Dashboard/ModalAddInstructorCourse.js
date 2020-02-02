import React from 'react';
import { Modal, Form, Button, Tab } from 'semantic-ui-react';
import CreateCourseForm from './CreateCourseForm';

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
                return (
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
                );
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