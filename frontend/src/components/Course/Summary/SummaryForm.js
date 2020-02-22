import React, { useState } from 'react';
import { Form, Button } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

const SummaryForm = (props) => {
  const [input, setInput] = useState({
    search: "",
    showRejected: false,
    queues: []
  });

  const handleInputChange = (e, {name, value}) => {
    input[name] = value;
    setInput(input);
    props.filterFunc(input);
  };

  const tagOptions = [];
  props.queues.forEach((queue) => {
    tagOptions.push({
      key: queue.name,
      value: queue.name,
      text: queue.name
    });
    queue.tags.forEach((tag) => {
      tagOptions.push({
        key: queue.name + " - " + tag,
        value: queue.name + " - " + tag,
        text: queue.name + " - " + tag
      });
    });
  });

  console.log(tagOptions);

  return (
    <Form>
      <Form.Group>
        <Form.Field>
          <Form.Dropdown multiple
            selection
            placeholder="Filter..."
            name="tags"
            onChange={ handleInputChange }
            options={ tagOptions }/>
        </Form.Field>
        <Form.Field>
          <Form.Input icon="search"
            placeholder="Search..."
            name="search"
            onChange={ handleInputChange }/>
        </Form.Field>
      </Form.Group>
    </Form>
  )
};

export default SummaryForm;
