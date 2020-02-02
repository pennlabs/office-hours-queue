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
          description
        }
      }
    }
  }
`;

const AddInstructorForm = () => {
  const [input, setInput] = useState({ department: null, name: null })
  const [results, setResults] = useState(null);
  
  const [joinableCourses, { loading, data }] = useLazyQuery(JOINABLE_COURSES);

  if (loading) return <div>Loading!</div>;

  if (data) {
    console.log(data.joinableCourses.edges.length);
    var new_results = [];
    data.joinableCourses.edges.map((course, index) => {
      new_results.push({
        key: index,
        text: course.node.department + " " + course.node.name,
        value: {
          department: course.node.department,
          name: course.node.name
        }
      })
    });
    if (!results || new_results.length != results.length || 
        JSON.stringify(new_results) != JSON.stringify(results)) {
      setResults(new_results);
    }
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
      {
        results &&
        <div>
        <Form.Field>
          <label>Results</label>
          <Form.Dropdown
            placeholder="Select Course"
            name="course"
            options={results}
            search
            selection/>
        </Form.Field>
        <Form.Field>
          <Button content="Add" color="green"/>
        </Form.Field>
        </div>
      }
    </Form>
  );
}

export default AddInstructorForm;
