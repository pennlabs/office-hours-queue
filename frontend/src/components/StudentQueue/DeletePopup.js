import React from 'react';
import { Modal, Form, Button } from 'semantic-ui-react';

// popup that pops up when a student tries to delete a question already asked
export default class EditQuestionModal extends React.Component {
  render() {
    return (
      <Modal open={this.props.attrs.open}>
        <Modal.Header>Are you sure you want to delete the Question?</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>Note that deleting the question means you will lose your place in the queue.</label>
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button content="Cancel" compact onClick={this.props.funcs.cancelFunc}/>
          <Button content="Delete" color="green" compact onClick={this.props.funcs.deleteFunc}/>
        </Modal.Actions>
      </Modal>
    );
  }

}
