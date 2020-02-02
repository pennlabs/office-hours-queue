import React, { useState } from 'react';
import { Form, Modal, Button } from 'semantic-ui-react';

import { gql } from 'apollo-boost';
import { useLazyQuery } from '@apollo/react-hooks';

const JOINABLE_COURSES = gql`
  query JoinableCourses($department: String, $name: String) {
    joinableCourses(department: $department, name: $name) {
      edges {
        node {
          department
          name
        }
      }
    }
  }
`;

const AddInstructorForm = () => {
  const [input, setInput] = useState({ department: null, name: null })
  const [results, setResults] = useState([]);
  
  const [joinableCourses, { loading, data }] = useLazyQuery(JOINABLE_COURSES);

  if (loading) return <div>Loading!</div>;

  if (data) {
    data.joinableCourses.edges.map(course => {
      console.log(course.node.department + " " + course.node.name);
    })
  }

  const handleInputChange = (e, { name, value }) => {
    input[name] = value;
    setInput(input);
  }

  const onSearch = () => {
    joinableCourses({ variables: {
      department: input.department,
      name: input.name
    }});
  }

  return (
    <Form>
      <Form.Field>
        <label>Department</label>
        <Form.Input name="department" onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <label>Course Code</label>
        <Form.Input name="name" onChange={ handleInputChange }/>
      </Form.Field>
      <Form.Field>
        <Button content="Search" color="blue" onClick={ onSearch }/>
      </Form.Field>
    </Form>
  );
}

export default AddInstructorForm;
