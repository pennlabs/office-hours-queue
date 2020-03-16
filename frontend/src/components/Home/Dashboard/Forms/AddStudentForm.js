import React, { useState } from 'react';
import { Form, Button } from 'semantic-ui-react';

import { gql } from 'apollo-boost';
import { useLazyQuery } from '@apollo/react-hooks';
import { useMutation } from '@apollo/react-hooks';
import { prettifySemester } from "../../../../utils/enums";
import { isValidEmail, useImperativeQuery } from "../../../../utils";
import AsyncSelect from "react-select/async";

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

/* FUNCTIONAL COMPONENT */
const AddStudentForm = (props) => {
  /* GRAPHQL QUERIES/MUTATIONS */
  const joinableCourses = useImperativeQuery(JOINABLE_COURSES);

  const promiseOptions = async (inputValue) => {
    if (inputValue.length === 0) {
      return [];
    }
    const { data } = await joinableCourses({
      searchableName_Icontains: inputValue,
    });
    return data.joinableCourses.edges.map((item) => {
      return {
        label: `${item.node.department} ${item.node.courseCode} (${item.node.courseTitle}, ${prettifySemester(item.node.semester)} ${item.node.year})`,
        value: item.node.id,
      }
    });
  };

  return (
    <Form>
      <Form.Field>
        <label>Course Name or Course Code</label>
        <AsyncSelect
          cacheOptions
          defaultOptions
          loadOptions={promiseOptions}
          isMulti
          placeholder={'Search...'}
          isValidNewOption={isValidEmail}
          onChange={ (items) => {
            props.changeFunc(undefined, {
              name: 'courseIds',
              value: items === null ? [] : items.map((item) => item.value),
            });
          }}
        />
      </Form.Field>
    </Form>
  );
};

export default AddStudentForm;
