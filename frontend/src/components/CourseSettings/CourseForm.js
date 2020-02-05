import React, { useState } from 'react';
import { gql } from 'apollo-boost';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Form, Button } from 'semantic-ui-react';

/* GRAPHQL QUERIES/MUTATIONS */
const GET_COURSE = gql`
  query Course($id: ID!) {
    course(id: $id) {
      id
      department
      name
      description
      year
      semester
      inviteOnly
    }
  }
`;

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

const AccountForm = (props) => {
  /* GRAPHQL QUERIES/MUTATIONS */
  const { loading, error, data, refetch } = useQuery(GET_COURSE, {
    variables: {
      id: props.courseId
    }
  });
  
  const [updateCourse, updateData] = useMutation(UPDATE_COURSE);

  /* STATE */
  const [input, setInput] = useState(null);

  if (data && data.course) {
    var newInput = {
      courseId: data.course.id,
      department: data.course.department,
      name: data.course.name,
      description: data.course.description,
      year: data.course.year,
      semester: data.course.semester,
      inviteOnly: data.course.inviteOnly
    }

    if (JSON.stringify(newInput) !== JSON.stringify(input)) {
      setInput(newInput);
    }
  }

  /* HANDLER FUNCTIONS */
  const handleInputChange = (e, { name, value }) => {
    input[name] = name === "inviteOnly" ? !input[name] : value;
    setInput(input);
  }

  const onSubmit = () => {
    console.log(updateCourse({
      variables: {
        input: input
      }
    }));
  }

  return (
    input ?
    <Form>
      <Form.Field>
        <label>Department</label>
        <Form.Input
          defaultValue={ data.course.department }
          name='department' required
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Course Code</label>
        <Form.Input
          defaultValue={ data.course.name }
          name='name' required
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Description</label>
        <Form.Input
          defaultValue={ data.course.description }
          name='description' required
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Year</label>
        <Form.Input
          defaultValue={ data.course.year }
          name='year' required
          onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Semester</label>
        <Form.Dropdown
          defaultValue={ data.course.semester }
          name="semester" required
          selection options={ semesterOptions }
          onChange={ handleInputChange } />
      </Form.Field>
      <Form.Field>
        <label>Invite Only?</label>
        <Form.Radio
          defaultChecked={ data.course.inviteOnly }
          name="inviteOnly" required
          value={true} toggle
          onChange={ handleInputChange }/>
      </Form.Field>
      <Button type='submit' onClick={ onSubmit }>Submit</Button>
      {
        updateData && updateData.data && <span>Updated!</span>
      }
    </Form> : <Form></Form>
     
  );
}

export default AccountForm;