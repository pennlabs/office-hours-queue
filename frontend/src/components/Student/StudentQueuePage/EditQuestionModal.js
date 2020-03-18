import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'semantic-ui-react';
import { useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

const UPDATE_QUESTION = gql`
  mutation UpdateQuestion($input: UpdateQuestionInput!) {
    updateQuestion(input: $input) {
      question {
        id
      }
    }
  }
`;

const EditQuestionModal = (props) => {
  const [queue, setQueue] = useState(props.queue);
  const [question, setQuestion] = useState(props.question);
  const [disabled, setDisabled] = useState(true);
  const [input, setInput] = useState({
    questionId: question.id,
    text: question.text,
    tags: question.tags,
    videoChatUrl: question.videoChatUrl
  });
  const [charCount, setCharCount] = useState(input.text.length);
  const [updateQuestion, { loading }] = useMutation(UPDATE_QUESTION);

  const isValid = () => {
    return (input.text && (!queue.requireVideoChatUrlOnQuestions || input.videoChatUrl)) &&
      (question.text !== input.text || JSON.stringify(question.tags) !== JSON.stringify(input.tags) ||
      question.videoChatUrl !== input.videoChatUrl);
  }

  const handleInputChange = (e, { name, value }) => {
    if (name === 'text' && value.length > 250) return;
    input[name] = value;
    setInput(input);
    setCharCount(input.text.length);
    setDisabled(!isValid())
  };

  const getDropdownOptions = (tags) => {
    return tags.map((tag) => {
      return {
        key: tag,
        value: tag,
        text: tag
      };
    });
  };

  const onSubmit = async () => {
    if (!queue.requireVideoChatUrlOnQuestions && !queue.videoChatEnabled) delete input.videoChatUrl;
    try {
      await updateQuestion({
        variables: {
          input: input
        }
      });
      props.refetch();
      props.setOpen(false);
      props.toastFunc("Question successfully updated", null);
    } catch (e) {
      props.setOpen(false);
      props.toastFunc(null, e);
    }
  };

  const resetInput = () => {
    setInput({
      questionId: question.id,
      text: question.text,
      tags: question.tags,
      videoChatUrl: question.videoChatUrl
    });
    setCharCount(question.text.length);
    setDisabled(true)
  }

  useEffect(() => {
    setQuestion(props.question)
  }, [props.question]);

  useEffect(() => {
    setQueue(props.queue)
  }, [props.queue])

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
              disabled={ loading }
              onChange={ handleInputChange }/>
              <div style={{"textAlign":"right",
                "color": charCount < 250 ? "" : "crimson"}}>
                  {"Characters: " +  charCount + "/250"}</div>
          </Form.Field>
          {
            (queue.requireVideoChatUrlOnQuestions || queue.videoChatEnabled) &&
            <Form.Field required={ queue.requireVideoChatUrlOnQuestions }>
              <label>Video Chat URL</label>
              <Form.Input
                name="videoChatUrl"
                disabled={ loading }
                placeholder={ 'https://zoom.us/j/578603907?pwd=L2ZhNkhlRnJPeGVwckcvY3hNak83QT09' }
                defaultValue={ question.videoChatUrl }
                onChange={ handleInputChange }/>
            </Form.Field>
          }
          {
            queue.tags && queue.tags.length > 0 &&
            <Form.Field>
              <label>Tags</label>
              <Form.Dropdown multiple selection
                name="tags"
                disabled={ loading }
                onChange={ handleInputChange }
                defaultValue={ question.tags }
                options={ getDropdownOptions(queue.tags) } />
            </Form.Field>
          }
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button content="Cancel" disabled={ loading } onClick={() => { resetInput(); props.setOpen(false) }}/>
        <Button content="Submit" disabled={ loading || disabled } loading={ loading } color="green" onClick={ onSubmit }/>
      </Modal.Actions>
    </Modal>
  );
}

export default EditQuestionModal;
