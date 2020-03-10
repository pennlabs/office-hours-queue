import React, { useState, useEffect } from 'react';
import { Segment, Form, Header, Button } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

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
  const [createQuestion, { loading, data }] = useMutation(CREATE_QUESTION);
  const [queue, setQueue] = useState(props.queue);
  const [input, setInput] = useState({
    queueId: props.queue.id,
    text: "",
    tags: [],
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

  const onSubmit = async () => {
    await createQuestion({
      variables: {
        input: input
      }
    });
    await props.refetch();
    props.successFunc(true);
  };

  useEffect(() => {
    setQueue(props.queue);
  }, [props.queue]);

  return (
    queue && <div>
      <Segment style={{"marginTop":"20px"}} attached="top" color="blue">
        <Header content="Add a Question"/>
      </Segment>
      <Segment attached secondary>
        <Form>
          <Form.Field>
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
          <Form.Field>
            <label>Tags</label>
            <Form.Dropdown multiple selection
            name="tags"
            disabled={ loading }
            onChange={ handleInputChange }
            options={ getDropdownOptions(queue.tags) } />
          </Form.Field>
        </Form>
      </Segment>
      <Segment attached="bottom">
        <Button compact
          content="Submit"
          color="blue"
          disabled={ loading }
          onClick={ onSubmit }/>
      </Segment>
    </div>
  );
};

export default QuestionForm;
