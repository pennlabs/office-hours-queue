import React, { useState } from 'react';
import { Modal, Form, Button, Header, Label } from 'semantic-ui-react';

const EditQuestionModal = (props) => {
  const [queue, setQueue] = useState(props.queue);
  const [question, setQuestion] = useState(props.question);
  const [success, setSuccess] = useState(false);
  const [input, setInput] = useState({
    text: question.text,
    tags: question.tags,
  });
  const [charCount, setCharCount] = useState(0);

  const handleInputChange = (e, { name, value }) => {
    if (name === 'text' && value.length > 250) return;
    input[name] = value;
    setInput(input);
    setCharCount(input.text.length)
  };

  const getDropdownOptions = (tags) => {
    return tags.map((tag) => {
      return {
        key: tag,
        value: tag,
        text: tag,
      };
    });
  };

  const onSubmit = () => {
  };

  return (
    <Modal open={ props.open }>
      <Modal.Header>Edit Question</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Field>
            <label>Question</label>
            <Form.TextArea
              name="text"
              value={ input.text }
              onChange={ handleInputChange }/>
              <div style={{"textAlign":"right",
                "color": charCount < 250 ? "" : "crimson"}}>
                  {"Characters: " +  charCount + "/250"}</div>
          </Form.Field>
          <Form.Field>
            <label>Tags</label>
            <Form.Dropdown multiple selection
              name="tags"
              onChange={ handleInputChange }
              value={ input.tags }
              options={ getDropdownOptions(queue.tags) } />
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button content="Cancel" />
        <Button content="Submit" color="green"/>
      </Modal.Actions>
    </Modal>
  );
}

export default EditQuestionModal;
