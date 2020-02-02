import React, { useState } from 'react';
import { Grid } from 'semantic-ui-react';
import CourseCard from './CourseCard';
import AddCard from './AddCard';
import ModalAddInstructorCourse from './ModalAddInstructorCourse';


import { gql } from 'apollo-boost';
import { useLazyQuery } from '@apollo/react-hooks';
import { useQuery } from '@apollo/react-hooks';

const FIND_COURSES = gql`
  {
    currentUser {
      courseUsers(kind: "PROFESSOR") {
        edges {
          node {
            course {
              name
              department
              description
            }
          }
        }
      }
    }
  }
`;

const InstructorCourses = (props) => {
  const { loading, error, data, refetch } = useQuery(FIND_COURSES);
  const [open, setOpen] = useState(false);

  const triggerFunc = () => {
    setOpen(!open);
  }

  const closeFunc = () => {
    refetch();
    triggerFunc();
  }

  return (
    <Grid.Row columns={4} padded="true">
      <ModalAddInstructorCourse
          open={ open }
          closeFunc={ closeFunc }/>
      {
        data && data.currentUser.courseUsers &&
        data.currentUser.courseUsers.edges.map(courseUser => (
          !courseUser.node.course.archived &&
          <Grid.Column>
            <CourseCard
              name={courseUser.node.course.name}
              department={courseUser.node.course.department}
              description={courseUser.node.course.description}
              totalQueues={0}
              openQueues={0}
              archived={courseUser.node.course.archived}
            />
          </Grid.Column>
        ))
      }
      <Grid.Column>
        <AddCard clickFunc={ triggerFunc }/>
      </Grid.Column>
    </Grid.Row>
  );
}

export default InstructorCourses;
