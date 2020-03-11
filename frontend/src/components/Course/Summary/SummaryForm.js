import React, { useState } from 'react';
import { Form, Button } from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import TextField from '@material-ui/core/TextField';

const SummaryForm = (props) => {
  const [input, setInput] = useState({ search: "" });

  const handleInputChange = (e, {name, value}) => {
    input[name] = value;
    setInput(input);
    props.filterFunc(input);
  };

  return (
    <Form>
      <Form.Group>
        <Form.Field>
          <label>After</label>
          <TextField
            type="date"
            onChange={ (event) => {
              input.after = event.target.value;
              setInput(input);
              props.filterFunc(input);
            } }
            InputLabelProps={{ shrink: true }}/>
        </Form.Field>
        <Form.Field>
          <label>Before</label>
          <TextField
            type="date"
            onChange={ (event) => {
              input.before = event.target.value;
              setInput(input);
              props.filterFunc(input);
            } }
            InputLabelProps={{ shrink: true }}/>
        </Form.Field>
        <Form.Field>
          <label>Search</label>
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
