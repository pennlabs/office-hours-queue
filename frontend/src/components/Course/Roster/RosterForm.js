import React, { useState } from 'react';
import { Form, Button } from 'semantic-ui-react';
import { roleOptions } from "../../../utils/enums";

const RosterForm = (props) => {
  const [input, setInput] = useState({
    search: "",
    role: ""
  });

  const handleInputChange = (e, { name, value }) => {
    input[name] = value.toLowerCase();
    setInput(input);
    props.filterFunc(input);
  };

  return (
    <Form>
      <Form.Field>
        { props.showInviteButton &&
          <Button
            content="Invite"
            color="blue"
            floated="right"
            onClick={props.inviteFunc}
            icon="add user"/>
        }
        { props.showShowInvitedButton &&
          <Button
            content={props.invitedShown ? "Hide Invited" : "Show Invited"}
            color="grey"
            floated="right"
            onClick={ props.showInvitedFunc }/>
        }
      </Form.Field>
      <Form.Group>
        <Form.Field>
          <Form.Dropdown selection
            clearable
            placeholder="Filter..."
            name="role"
            onChange={ handleInputChange }
            options={ roleOptions }/>
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

export default RosterForm;
