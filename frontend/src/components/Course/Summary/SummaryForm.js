import React, { useState } from 'react';
import { Form } from 'semantic-ui-react';
import TextField from '@material-ui/core/TextField';

const SummaryForm = (props) => {
  const [input, setInput] = useState({ search: "", state: [] });
  const stateOptions = [{
    key: "ACTIVE",
    value: "ACTIVE",
    text: "Active"
  }, {
    key: "WITHDRAWN",
    value: "WITHDRAWN",
    text: "Withdrawn",
  }, {
    key: "REJECTED",
    value: "REJECTED",
    text: "Rejected",
  }, {
    key: "ANSWERED",
    value: "ANSWERED",
    text: "Answered",
  }]

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
          <label>Result</label>
          <Form.Dropdown multiple
            selection
            name="state"
            options={ stateOptions }
            onChange={ handleInputChange }/>
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
