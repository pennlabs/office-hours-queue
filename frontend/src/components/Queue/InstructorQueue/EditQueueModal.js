import React from 'react';
import { Modal, Form, Button } from 'semantic-ui-react';

const days = [
  {key: 'MON', value: 'MON', text: 'Monday'},
  {key: 'TUES', value: 'TUES', text: 'Tuesday'},
  {key: 'WED', value: 'WED', text: 'Wednesday'},
  {key: 'THURS', value: 'THURS', text: 'Thursday'},
  {key: 'FRI', value: 'FRI', text: 'Friday'},
  {key: 'SAT', value: 'SAT', text: 'Saturday'},
  {key: 'SUN', value: 'SUN', text: 'Sunday'},
]
export default class EditQueueModal extends React.Component {
  render() {
    return (
      <Modal open={this.props.attrs.open}>
        <Modal.Header>{this.props.attrs.queue.name}</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Form>
              <Form.Input label="Title" placeholder={this.props.attrs.queue.name}/>
              <Form.Input label="Description" placeholder={this.props.attrs.queue.description}/>
              <Form.Group widths="equal">
                <Form.Field>
                  <Form.Dropdown label="Day" selection placeholder="Day of the Week" options={days}/>
                </Form.Field>
                <Form.Field>
                  <Form.Input label="Open" placeholder="HH:MM"/>
                </Form.Field>
                <Form.Field>
                  <Form.Input label="Close" placeholder="HH:MM"/>
                </Form.Field>
              </Form.Group>
              <Button color="red" content="Close Manually"/>
              <Button color="green" content="Open Manually"/>
            </Form>

          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button content="Cancel" compact onClick={this.props.funcs.closeFunc}/>
          <Button content="Submit" color="blue" compact/>
        </Modal.Actions>
      </Modal>
    );
  }
}
