import React from 'react';
import { Form, Modal, Button, Segment, Dropdown, TextArea } from 'semantic-ui-react';

const deleteOptions = [
  {key: 'NOT_HERE', value: 'NOT_HERE', text: 'Not Here'},
  {key: 'OH_ENDED', value: 'OH_ENDED', text: 'OH Ended'},
  {key: 'NOT_SPECIFIC', value: 'NOT_SPECIFIC', text: 'Not Specific'},
  {key: 'WRONG_QUEUE', value: 'WRONG_QUEUE', text: 'Wrong Queue'},
  {key: 'OTHER', value: 'OTHER', text: 'Other'}
]

export default class DeleteQuestionModal extends React.Component {
  render() {
    return (
      <Modal open={this.props.attrs.open}>
        <Modal.Header>Delete Question</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            You are about to delete the following question from
            <b>{" " + this.props.question.asker}</b>:<br/>
            <Segment inverted color="blue">{'"' + this.props.question.text + '"'}</Segment>
            <Form>
              <Form.Field>
                <Dropdown
                   placeholder="Select Reason"
                   options={deleteOptions}
                   selection
                   onChange={this.props.funcs.dropdownFunc}
                   value={this.props.attrs.reason}
                 />
              </Form.Field>
              <Form.Field
                control={TextArea}
                disabled={this.props.attrs.textDisabled}
              />
            </Form>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button content="Cancel" compact onClick={this.props.funcs.closeFunc}/>
          <Button content="Delete" color="red" compact onClick={this.props.funcs.deleteFunc}/>
        </Modal.Actions>
      </Modal>
    );
  }
}
