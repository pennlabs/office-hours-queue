import React, { useState } from 'react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import { Form, Button } from 'semantic-ui-react';
import { semesterOptions } from "../../../utils/enums";

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

const CourseForm = (props) => {
  /* GRAPHQL QUERIES/MUTATIONS */
  const [updateCourse, { loading, data }] = useMutation(UPDATE_COURSE);

  /* STATE */
  const [defCourse, setDefCourse] = useState(props.course);
  const [input, setInput] = useState({ courseId: props.course.id });
  const [success, setSuccess] = useState(false);

  /* HANDLER FUNCTIONS */
  const handleInputChange = (e, { name, value }) => {
    input[name] = name === "inviteOnly" ? !input[name] : value;
    setInput(input);
  };

  const onSubmit = () => {
    updateCourse({
      variables: {
        input: input
      }
    }).then(() => {
      props.refetch();
      setSuccess(true);
    });
  };

  return (
    <Form>
      <Form.Field>
        <label>Department</label>
        <Form.Input
          defaultValue={ defCourse.department }
          name='department'
          disabled={ loading }
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Course Code</label>
        <Form.Input
          defaultValue={ defCourse.courseCode }
          name='courseCode'
          disabled={ loading }
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Course Title</label>
        <Form.Input
          defaultValue={ defCourse.courseTitle }
          name='courseTitle'
          disabled={ loading }
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Year</label>
        <Form.Input
          defaultValue={ defCourse.year }
          name='year'
          disabled={ loading }
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Semester</label>
        <Form.Dropdown
          defaultValue={ defCourse.semester }
          name="semester"
          disabled={ loading }
          selection options={ semesterOptions }
          onChange={ handleInputChange } />
      </Form.Field>
      <Form.Field>
        <label>Invite Only?</label>
        <Form.Radio
          defaultChecked={ defCourse.inviteOnly }
          name="inviteOnly"
          disabled={ loading }
          value={true} toggle
          onChange={ handleInputChange }/>
      </Form.Field>
      <Button type='submit' disabled={ loading } onClick={ onSubmit }>Submit</Button>
      {
        success && !loading && <span>Updated!</span>
      }
      {
        loading && <span>Updating...</span>
      }
    </Form>
  );
}

export default CourseForm;
