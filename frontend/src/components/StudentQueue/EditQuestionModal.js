import React from 'react';
import { Modal, Form, Button } from 'semantic-ui-react';

//modal for adding student courses (props: submit and change function, and open boolean)
export default class EditQuestionModal extends React.Component {
  render() {
    return (
      <Modal open={this.props.attrs.open}>
        <Modal.Header>Edit Question</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>Question</label>
              <Form.Input name="text" onChange={this.props.funcs.changeFunc}/>
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button content="Cancel" compact onClick={this.props.funcs.closeFunc}/>
          <Button content="Submit" color="green" compact onClick={this.props.funcs.submitFunc}/>
        </Modal.Actions>
      </Modal>
    );
  }

}
