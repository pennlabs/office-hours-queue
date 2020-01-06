import React from 'react';
import { Modal, Form, Button, Header, Label } from 'semantic-ui-react';

// Form through which students can change the question they asked
export default class EditQuestionModal extends React.Component {
  render() {
    return (
      <Modal open={this.props.attrs.open}>
        <Modal.Header>Edit Question</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>Question</label>
              <Form.Input placeholder={this.props.attrs.prevQuestion} name="text" onChange={this.props.funcs.changeFunc} />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Content>
          <Header as="h3" content="Select Tag(s)" />
          {
            this.props.attrs.allTags.length > 0 ? this.props.attrs.allTags.map((tag, index) => (
              <Label
                as="a"
                color={tag.isActive ? "blue" : ""}
                onClick={() => this.props.funcs.tagQuestionFunc(index)}
              >
                {tag.name}
              </Label>
            )) : <Label color="blue">No Tags</Label>
          }
        </Modal.Content>
        <Modal.Actions>
          <Button content="Cancel" compact onClick={this.props.funcs.closeFunc} />
          <Button content="Submit" color="green" compact onClick={this.props.funcs.submitFunc} />
        </Modal.Actions>
      </Modal>
    );
  }

}
