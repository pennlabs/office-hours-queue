import React, { useState } from 'react';
import { Form, Modal, Button } from 'semantic-ui-react';

import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

/* GRAPHQL QUERIES/MUTATIONS */
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

const semesterOptions = [
  {
    key: 0,
    text: "Fall",
    value: "FALL"
  },
  {
    key: 1,
    text: "Spring",
    value: "SPRING"
  },
  {
    key: 2,
    text: "Summer",
    value: "SUMMER"
  }
]

/* FUNCTIONAL COMPONENT */
const CreateCourseForm = () => {
  /* STATE */
  const [input, setInput] = useState({ department: null, name: null, year: null, semester: null, inviteOnly: false })

  /* GRAPHQL QUERIES/MUTATIONS */
  const [createCourse, { data }] = useMutation(CREATE_COURSE);

  /* HANDLER FUNCTIONS */
  const handleInputChange = (e, { name, value }) => {
    
    input[name] = name === "inviteOnly" ? !input[name] : value;
    setInput(input);
    console.log(input.inviteOnly);
  }

  const onSubmit = () => {
    createCourse({
      variables: {
        input: input
      }
    });
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
        <Form.Dropdown name="semester" onChange={ handleInputChange } selection options={ semesterOptions }/>
      </Form.Field>
      <Form.Field>
        <label>Invite Only?</label>
        <Form.Radio name="inviteOnly" onChange={ handleInputChange } value={true} toggle/>
      </Form.Field>
      <Form.Field>
          <Button content="Create" color = "green" onClick={onSubmit}/>
          { 
            data &&
            <span style={{"margin-left":"20px"}}>Created!</span>
          }
      </Form.Field>
    </Form>
  );
}

export default CreateCourseForm;
