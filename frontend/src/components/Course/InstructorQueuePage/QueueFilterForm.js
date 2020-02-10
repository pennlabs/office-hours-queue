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

  return (
    <Form style={{"marginTop":"10px"}}>
      {
        tagOptions && <Form.Group>
        <Form.Field>
          <label>Status</label>
          <Form.Dropdown clearable
            selection
            options={ statusOptions }/>
        </Form.Field>
        <Form.Field>
          <label>Tags</label>
          <Form.Dropdown multiple
            selection
            options={ tagOptions }/>
        </Form.Field>
      </Form.Group>
      }
    </Form>
  )
}

export default QueueFilterForm;