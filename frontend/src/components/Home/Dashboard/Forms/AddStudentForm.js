import React, { useState } from 'react';
import { Form, Button } from 'semantic-ui-react';

import { gql } from 'apollo-boost';
import { useLazyQuery } from '@apollo/react-hooks';
import { useMutation } from '@apollo/react-hooks';
import { prettifySemester } from "../../../../utils/enums";

/* GRAPHQL QUERIES/MUTATIONS */
const JOINABLE_COURSES = gql`
  query JoinableCourses($searchableName_Icontains: String) {
    joinableCourses(searchableName_Icontains: $searchableName_Icontains) {
      edges {
        node {
          id
          department
          courseCode
          courseTitle
          year
          semester
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
const AddStudentForm = () => {
  /* STATE */
  const [input, setInput] = useState({
    name: null,
    courseId: null,
  });
  const [results, setResults] = useState(null);

  /* GRAPHQL QUERIES/MUTATIONS */
  const [joinableCourses, { loading, data }] = useLazyQuery(JOINABLE_COURSES);
  const [joinCourse, joinData] = useMutation(JOIN_COURSE);

  /* LOADING SEARCH RESULTS */
  if (data) {
    const newResults = data.joinableCourses.edges.map((course) => {
      return {
        key: course.node.id,
        text: `${course.node.department} ${course.node.courseCode} (${course.node.courseTitle}, ${prettifySemester(course.node.semester)} ${course.node.year})`,
        value: course.node.id
      };
    });
    if (!results || newResults.length !== results.length ||
        JSON.stringify(newResults) !== JSON.stringify(results)) {
      setResults(newResults);
    }
  }

  /* HANDLER FUNCTIONS */
  const handleInputChange = (e, { name, value }) => {
    input[name] = value;
    setInput(input);
    if (name === 'name') {
      onSearch();
    }
  };

  const onSearch = () => {
    if (input.name.length < 2) {
      setResults(null);
      return;
    }
    joinableCourses({
      variables: {
        searchableName_Icontains: input.name,
      }
    });
  };

  const onSubmit = async () => {
    await joinCourse({
      variables: {
        input: {
          courseId: input.courseId
        }
      }
    });
  };

  return (
    <Form>
      <Form.Field>
        <label>Course Name</label>
        <Form.Input name="name" onChange={ handleInputChange }/>
      </Form.Field>
      {/* <Form.Field>
        <Button content="Search" color="blue" onClick={ onSearch }/>
      </Form.Field> */}
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
};

export default AddStudentForm;
