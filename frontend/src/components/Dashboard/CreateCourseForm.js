import React, { useState } from 'react';
import { Form, Modal, Button } from 'semantic-ui-react';

import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

const CREATE_COURSE = gql`
  mutation CreateCourse($input: CreateCourseInput!) {
    createCourse(input: $input) {
      course {
        id
      }
      courseUser {
        id
      }
    }
  }
`;

const CreateCourseForm = (props) => {
  const [open, setOpen] = useState(props.open);
  const [input, setInput] = useState({ department: null, name: null, year: null, semester: null, inviteOnly: false })
  const [results, setResults] = useState([]);

  const [createCourse, { data }] = useMutation(CREATE_COURSE);

  const handleInputChange = (e, { name, value }) => {
    input[name] = value;
    setInput(input);
  }

  const onSubmit = () => {
    console.log(createCourse({variables: {
      input: input
    }}));
  }

  return (
    <Form>
      <Form.Field>
        <label>Department</label>
        <Form.Input name="department" onChange={ handleInputChange } placeholder="CIS"/>
      </Form.Field>
      <Form.Field>
        <label>Course Code</label>
        <Form.Input name="name" onChange={ handleInputChange } placeholder="121"/>
      </Form.Field>
      <Form.Field>
        <label>Course Title</label>
        <Form.Input name="description" onChange={ handleInputChange } placeholder="Data Structures and Algorithms"/>
      </Form.Field>
      <Form.Field>
        <label>Year</label>
        <Form.Input name="year" onChange={ handleInputChange } placeholder="2020"/>
      </Form.Field>
      <Form.Field>
        <label>Semester</label>
        <Form.Input name="semester" onChange={ handleInputChange } placeholder="FALL"/>
      </Form.Field>
      <Form.Field>
          <Button content="Create" color = "green" onClick={onSubmit}/>
      </Form.Field>
    </Form>
  );
}

export default CreateCourseForm;
