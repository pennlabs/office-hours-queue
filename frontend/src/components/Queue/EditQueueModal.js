import React from 'react';
import { Modal, Segment, Header, Form, Button } from 'semantic-ui-react';

export default class EditQueueModal extends React.Component {
  render() {
    return (
      <Modal open={this.props.attrs.open}>
        <Modal.Header>{this.props.attrs.queue.name}</Modal.Header>
        <Modal.Content>
          <Modal.Description>
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
