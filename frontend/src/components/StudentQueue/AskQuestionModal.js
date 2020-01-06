import React from 'react';
import { Modal, Form, Button } from 'semantic-ui-react';

// Form that students submit questions through
export default class AskQuestionModal extends React.Component {
  render() {
    return (
      <Modal open={this.props.attrs.open}>
        <Modal.Header>Add New Question</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>Question</label>
              <Form.Input name="text" onChange={this.props.funcs.changeFunc} />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button content="Cancel" compact onClick={this.props.funcs.closeFunc} />
          <Button content="Submit" color="green" compact onClick={this.props.funcs.submitFunc} />
        </Modal.Actions>
      </Modal>
    );
  }

}
