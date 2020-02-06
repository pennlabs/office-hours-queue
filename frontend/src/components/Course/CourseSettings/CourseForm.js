import React, { useState } from 'react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import { Form, Button } from 'semantic-ui-react';

/* GRAPHQL QUERIES/MUTATIONS */
const UPDATE_COURSE = gql`
  mutation UpdateCourse($input: UpdateCourseInput!) {
    updateCourse(input: $input) {
      course {
        id
      }
    }
  }
`;

/* DROPDOWN OPTIONS */
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

const CourseForm = (props) => {
  /* GRAPHQL QUERIES/MUTATIONS */
  const [updateCourse, updateData] = useMutation(UPDATE_COURSE);

  /* STATE */
  const [defCourse, setDefCourse] = useState(props.course);
  const [input, setInput] = useState({ courseId: props.course.id });
  console.log(input);

  /* HANDLER FUNCTIONS */
  const handleInputChange = (e, { name, value }) => {
    input[name] = name === "inviteOnly" ? !input[name] : value;
    setInput(input);
  }

  const onSubmit = () => {
    updateCourse({
      variables: {
        input: input
      }
    });
  }

  return (
    <Form>
      <Form.Field>
        <label>Department</label>
        <Form.Input
          defaultValue={ defCourse.department }
          name='department' required
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Course Code</label>
        <Form.Input
          defaultValue={ defCourse.name }
          name='name' required
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Description</label>
        <Form.Input
          defaultValue={ defCourse.description }
          name='description' required
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Year</label>
        <Form.Input
          defaultValue={ defCourse.year }
          name='year' required
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Semester</label>
        <Form.Dropdown
          defaultValue={ defCourse.semester }
          name="semester" required
          selection options={ semesterOptions }
          onChange={ handleInputChange } />
      </Form.Field>
      <Form.Field>
        <label>Invite Only?</label>
        <Form.Radio
          defaultChecked={ defCourse.inviteOnly }
          name="inviteOnly" required
          value={true} toggle
          onChange={ handleInputChange }/>
      </Form.Field>
      <Button type='submit' onClick={ onSubmit }>Submit</Button>
      {
        updateData && updateData.data && <span>Updated!</span>
      }
    </Form>
  );
}

export default CourseForm;