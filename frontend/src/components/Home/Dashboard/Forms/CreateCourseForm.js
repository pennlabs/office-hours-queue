import React, { useState } from 'react';
import { Form, Modal, Button } from 'semantic-ui-react';

import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import { semesterOptions } from "../../../../utils/enums";

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

const CreateCourseForm = (props) => {
  /* STATE */
  const [input, setInput] = useState({ inviteOnly: false });

  /* GRAPHQL QUERIES/MUTATIONS */
  const [createCourse, { data }] = useMutation(CREATE_COURSE);

  /* HANDLER FUNCTIONS */
  const handleInputChange = (e, { name, value }) => {
    input[name] = name === "inviteOnly" ? !input[name] : value;
    setInput(input);
  };

  const onSubmit = async () => {
    if (!input.department || !input.courseCode || !input.courseTitle ||
        !input.year || !input.semester || !input.courseUserKind) return;

    try {
      await createCourse({
        variables: {
          input: input
        }
      });
      await props.refetch();
      props.toastFunc(`${input.department} ${input.courseCode}`, true);
    } catch (e) {
      props.toastFunc(null, false);
    } 
  };

  return (
    <Form>
      <Form.Field>
        <label>Department</label>
        <Form.Input name="department" onChange={ handleInputChange } placeholder="CIS"/>
      </Form.Field>
      <Form.Field>
        <label>Course Code</label>
        <Form.Input name="courseCode" onChange={ handleInputChange } placeholder="121"/>
      </Form.Field>
      <Form.Field>
        <label>Course Title</label>
        <Form.Input name="courseTitle" onChange={ handleInputChange } placeholder="Data Structures and Algorithms"/>
      </Form.Field>
      <Form.Field>
        <label>Description</label>
        <Form.TextArea name="description" onChange={ handleInputChange } placeholder="(Optional)"/>
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
        <label>Your Role</label>
        <Form.Dropdown selection
          name="courseUserKind"
          onChange={ handleInputChange }
          options={[{
            key: "PROFESSOR",
            value: "PROFESSOR",
            text: "Professor"
          }, {
            key: "HEAD_TA",
            value: "HEAD_TA",
            text: "Head TA"
          }]}/>
      </Form.Field>
      <Form.Field>
          <Button content="Create" color = "green" onClick={onSubmit}/>
      </Form.Field>
    </Form>
  );
}

export default CreateCourseForm;
