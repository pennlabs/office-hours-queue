import React, {useMemo} from 'react';
import { Form } from 'semantic-ui-react';

import { gql } from 'apollo-boost';
import { prettifySemester } from "../../../../utils/enums";
import { isValidEmail, uidFromGlobalId, useImperativeQuery } from "../../../../utils";
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

  const existingCourses = useMemo(
    () => new Set(props.allCourses.map((course) => uidFromGlobalId(course.id))),
    [props.allCourses]
  );

  const promiseOptions = async (inputValue) => {
    if (inputValue.length === 0) {
      return [];
    }
    const { data } = await joinableCourses({
      searchableName_Icontains: inputValue,
    });
    return data.joinableCourses.edges.map((item) => {
      console.log("id", uidFromGlobalId(item.node.id));
      const existing = existingCourses.has(uidFromGlobalId(item.node.id));
      const courseString = `${item.node.department} ${item.node.courseCode} (${item.node.courseTitle}, ${prettifySemester(item.node.semester)} ${item.node.year})`;
      return {
        label: `${existing ? 'Already enrolled in ' : ''} ${courseString}`,
        value: item.node.id,
        disabled: existing,
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
          isOptionDisabled={(option) => option.disabled}
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
