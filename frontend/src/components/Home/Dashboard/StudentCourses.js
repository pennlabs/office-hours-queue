import React, { useState } from 'react';
import { Grid } from 'semantic-ui-react';
import CourseCard from './CourseCard';
import AddCard from './AddCard';
import ModalAddStudentCourse from './ModalAddStudentCourse';


import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

/* GRAPHQL QUERIES/MUTATIONS */
const FIND_COURSES = gql`
  {
    currentUser {
      courseUsers(kind: "STUDENT") {
        edges {
          node {
            course {
              name
              department
              description
              id
            }
          }
        }
      }
    }
  }
`;

/* FUNCTIONAL COMPONENT */
const StudentCourses = (props) => {
  /* STATE */
  const [open, setOpen] = useState(false);

  /* GRAPHQL QUERIES/MUTATIONS */
  const { loading, error, data, refetch } = useQuery(FIND_COURSES);

  /* OPENING/CLOSING MODAL */
  const triggerFunc = () => {
    setOpen(!open);
  }

  /* CLOSING MODAL AND REFECTHING DATA */
  const closeFunc = () => {
    refetch();
    triggerFunc();
  }

  return (
    <Grid.Row columns={4} padded="true">
      <ModalAddStudentCourse
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
              id={courseUser.node.course.id}
              totalQueues={0}
              openQueues={0}
              archived={courseUser.node.course.archived}/>
          </Grid.Column>
        ))
      }
      <Grid.Column>
        <AddCard clickFunc={ triggerFunc }/>
      </Grid.Column>
    </Grid.Row>
  );
}

export default StudentCourses;
