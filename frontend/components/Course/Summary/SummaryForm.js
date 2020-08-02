import React, { useState } from "react";
import { Form } from "semantic-ui-react";
import TextField from "@material-ui/core/TextField";

const SummaryForm = (props) => {
  const [input, setInput] = useState({});
  const stateOptions = [
    {
      key: "ACTIVE",
      value: "ACTIVE",
      text: "Active",
    },
    {
      key: "WITHDRAWN",
      value: "WITHDRAWN",
      text: "Withdrawn",
    },
    {
      key: "REJECTED",
      value: "REJECTED",
      text: "Rejected",
    },
    {
      key: "ANSWERED",
      value: "ANSWERED",
      text: "Answered",
    },
  ];

  const handleInputChange = (e, { name, value }) => {
    input[name] = value;
    setInput(input);
    props.filterFunc(input);
  };

  const onSearchChange = (e, { name, value }) => {
    props.searchFunc(value);
  };

  return (
    <Form>
      <Form.Group>
        <Form.Field>
          <label>After</label>
          <TextField
            type="date"
            onChange={(event) => {
              const time = event.target.value;
              input.timeAsked_Gt = time === "" ? "" : time + "T00:00:00";
              setInput(input);
              props.filterFunc(input);
            }}
            InputLabelProps={{ shrink: true }}
          />
        </Form.Field>
        <Form.Field>
          <label>Before</label>
          <TextField
            type="date"
            onChange={(event) => {
              const time = event.target.value;
              input.timeAsked_Lt = time === "" ? "" : time + "T22:59:59";
              setInput(input);
              props.filterFunc(input);
            }}
            InputLabelProps={{ shrink: true }}
          />
        </Form.Field>
        <Form.Field>
          <label>State</label>
          <Form.Dropdown
            selection
            name="state"
            clearable
            placeholder={"State"}
            options={stateOptions}
            onChange={handleInputChange}
          />
        </Form.Field>
        <Form.Field>
          <label>Search</label>
          <Form.Input
            icon="search"
            placeholder="Search..."
            onChange={onSearchChange}
          />
        </Form.Field>
      </Form.Group>
    </Form>
  );
};

export default SummaryForm;
