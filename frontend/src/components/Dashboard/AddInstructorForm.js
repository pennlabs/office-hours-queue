import React, { useState } from 'react';
import { Form, Modal, Button } from 'semantic-ui-react';

import { gql } from 'apollo-boost';
import { useLazyQuery } from '@apollo/react-hooks';
import { useMutation } from '@apollo/react-hooks';

/* GRAPHQL QUERIES/MUTATIONS */
const JOINABLE_COURSES = gql`
  query JoinableCourses($department: String, $name: String) {
    joinableCourses(department: $department, name: $name) {
      edges {
        node {
          id
          department
          name
          description
        }
      }
    }
  }
`;

const JOIN_COURSE = gql`
  mutation JoinCourse($input: JoinCourseInput!) {
    joinCourse(input: $input) {
      courseUser
    }
  }
`;

/* FUNCTIONAL COMPONENT */
const AddInstructorForm = () => {
  /* STATE */
  const [input, setInput] = useState({ department: null, name: null })
  const [results, setResults] = useState(null);
  
  /* GRAPHQL QUERIES/MUTATIONS */
  const [joinableCourses, { loading, searchData }] = useLazyQuery(JOINABLE_COURSES);
  //const [joinCourse, { joinData }] = useMutation(JOIN_COURSE);

  console.log(searchData);

  /* LOADING SEARCH RESULTS */
  if (searchData) {
    console.log(searchData.joinableCourses.edges.length);
    var new_results = [];
    searchData.joinableCourses.edges.map((course, index) => {
      new_results.push({
        key: course.node.id,
        text: course.node.department + " " + course.node.name + " (" + course.node.description + ")",
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

  /* HANDLER FUNCTIONS */
  const handleInputChange = (e, { name, value }) => {
    console.log(name + " " + value);
    input[name] = value;
    setInput(input);
  }

  const onSearch = () => {
    console.log(
    joinableCourses({ variables: {
      department: input.department,
      name: input.name
    }})
    );
  }

  /*
  const onSubmit = () => {
    joinCourse({
      variables: {
        input: {
        }
      }
    })
  }*/

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
