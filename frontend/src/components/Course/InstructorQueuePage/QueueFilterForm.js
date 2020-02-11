import React, { useState } from 'react';
import { Form } from 'semantic-ui-react';

const statusOptions = [
  {
    key: "UNANSWERED",
    value: "UNANSWERED",
    text: "Unanswered"
  },
  {
    key: "STARTED",
    value: "STARTED",
    text: "Started"
  },
  {
    key: "REJECTED",
    value: "REJECTED",
    text: "Rejected"
  }
]

const QueueFilterForm = (props) => {
  const tagOptions = props.tags && props.tags.map((tag) => (
    {
      key: tag,
      value: tag,
      text: tag
    }
  ));
  const [input, setInput] = useState({ tags: [], status: null });

  const handleInputChange = (e, {name, value}) => {
    input[name] = value;
    setInput(input);
    props.changeFunc(input);
  }

  return (
    <Form style={{"marginTop":"10px"}}>
      {
        tagOptions && <Form.Group>
        <Form.Field>
          <label>Tags</label>
          <Form.Dropdown multiple
            clearable
            selection
            name="tags"
            options={ tagOptions }
            onChange={ handleInputChange }/>
        </Form.Field>
      </Form.Group>
      }
    </Form>
  )
}

export default QueueFilterForm;