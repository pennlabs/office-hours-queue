import React, { useState } from 'react';
import { Form, Button } from 'semantic-ui-react';

const RosterForm = (props) => {
  const [input, setInput] = useState({
    search: "M",
    role: ""
  })

  const handleInputChange = (e, { name, value }) => {
    input[name] = value.toUpperCase();
    setInput(input);
    props.filterFunc(input);
  }

  return (
    <Form>
      <Form.Field>
        <Button content="Invite" color="blue" floated="right"/>
      </Form.Field>
      <Form.Group>
        <Form.Field>
          <Form.Dropdown placeholder="Filter..." selection options={[{key: 0, value: 0, text:"hello"}]}/>
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
}

export default RosterForm;