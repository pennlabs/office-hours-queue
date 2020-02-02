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
      courseUser {
        id
        kind
      }
    }
  }
`;

/* FUNCTIONAL COMPONENT */
const AddInstructorForm = () => {
  /* STATE */
  const [input, setInput] = useState({ department: null, name: null, courseId: null });
  const [results, setResults] = useState(null);
  
  /* GRAPHQL QUERIES/MUTATIONS */
  const [joinableCourses, { loading, data }] = useLazyQuery(JOINABLE_COURSES);
  const [joinCourse, joinData] = useMutation(JOIN_COURSE);

  /* LOADING SEARCH RESULTS */
  if (data) {
    console.log(data.joinableCourses.edges.length);
    var new_results = [];
    data.joinableCourses.edges.map((course, index) => {
      new_results.push({
        key: course.node.id,
        text: course.node.department + " " + course.node.name + " (" + course.node.description + ")",
        value: course.node.id
      })
    });
    if (!results || new_results.length != results.length || 
        JSON.stringify(new_results) != JSON.stringify(results)) {
      setResults(new_results);
    }
  }

  /* CONFIRMING JOIN */
  if (joinData && joinData.data) {
    
  }

  /* HANDLER FUNCTIONS */
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
  
  const onSubmit = () => {
    console.log(joinCourse({
      variables: {
        input: {
          courseId: input.courseId
        }
      }
    }));
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
            name="courseId"
            options={results}
            search
            selection
            onChange={ handleInputChange }/>
        </Form.Field>
        <Form.Field>
          <Button content="Add" color="green" onClick={ onSubmit }/>
          { 
            joinData && joinData.data &&
            <span style={{"margin-left":"20px"}}>Added!</span>
          }
        </Form.Field>
        </div>
      }
    </Form>
  );
}

export default AddInstructorForm;
