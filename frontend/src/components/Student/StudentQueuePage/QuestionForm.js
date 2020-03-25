import React, { useState, useEffect } from 'react';
import { Segment, Form, Header, Button} from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import firebase from '../../Firebase';
import { isValidURL } from "../../../utils";


const CREATE_QUESTION = gql`
  mutation CreateQuestion($input: CreateQuestionInput!) {
    createQuestion(input: $input) {
      question {
        id
      }
    }
  }
`;

const QuestionForm = (props) => {
  const [createQuestion, { loading }] = useMutation(CREATE_QUESTION);
  const [queue, setQueue] = useState(props.queue);
  const [input, setInput] = useState({
    queueId: props.queue.id,
    text: "",
    tags: [],
  });
  const [charCount, setCharCount] = useState(0);
  const [disabled, setDisabled] = useState(true);
  const [validURL, setValidURL] = useState(!queue.requireVideoChatUrlOnQuestions);

  const handleInputChange = (e, { name, value }) => {
    if (name === 'text' && value.length > 250) return;
    input[name] = value;
    setInput(input);
    setCharCount(input.text.length);
    setDisabled(!input.text || (queue.requireVideoChatUrlOnQuestions && !input.videoChatUrl))
    if (name === 'videoChatUrl') {
      setValidURL(isValidURL(input.videoChatUrl))
      if (queue.videoChatEnabled && input.videoChatUrl === '') {
        setValidURL(true)
      }
    }
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

  const onSubmit = async () => {
    try {
      await createQuestion({
        variables: {
          input: input
        }
      });
      firebase.analytics.logEvent('question_created');
      await props.refetch();
      props.startPolling();
      props.toastFunc("Question successfully added to queue", null);
    } catch (e) {
      await props.refetch();
      props.toastFunc(null, e);
    }
  };

  useEffect(() => {
    setQueue(props.queue);
  }, [props.queue]);

  return (
    queue &&
    <div>
      <Segment style={{"marginTop":"20px"}} attached="top" color="blue">
        <Header content="Add a Question"/>
      </Segment>
      <Segment attached secondary>
        <Form>
          <Form.Field required>
            <label>Question</label>
            <Form.TextArea
              name="text"
              disabled={ loading }
              value={ input.text }
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
                placeholder={ 'Sample URL: https://zoom.us/j/123456789?pwd=abcdefg' }
                onChange={ handleInputChange }/>
          </Form.Field>
          }
          {
            queue.tags && queue.tags.length > 0 &&
            <Form.Field>
              <label>Tags</label>
              <Form.Dropdown multiple selection
              name="tags"
              placeholder="Select tags"
              disabled={ loading }
              onChange={ handleInputChange }
              options={ getDropdownOptions(queue.tags) } />
            </Form.Field>
          }
        </Form>
      </Segment>
      <Segment attached="bottom">
        <Button compact
          content="Submit"
          color="blue"
          disabled={ loading || disabled || !validURL }
          loading={ loading }
          onClick={ onSubmit }/>
      </Segment>
    </div>
  );
};

export default QuestionForm;
