import React, { useState } from 'react';
import { Grid } from 'semantic-ui-react';
import CourseCard from './CourseCard';
import ArchivedCourseCard from './ArchivedCourseCard';
import AddCard from './AddCard';
import ModalAddInstructorCourse from './ModalAddInstructorCourse';


import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

/* GRAPHQL QUERIES/MUTATIONS */
const FIND_COURSES = gql`
  {
    currentUser {
      courseUsers {
        edges {
          node {
            course {
              name
              department
              description
              year
              archived
            }
            kind
          }
        }
      }
    }
  }
`;

/* FUNCTIONAL COMPONENT */
const InstructorCourses = (props) => {
  /* STATE */
  const [open, setOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  /* GRAPHQL QUERIES/MUTATIONS */
  const { loading, error, data, refetch } = useQuery(FIND_COURSES);


  /* HANDLER FUNCTIONS */
  const triggerFunc = () => {
    setOpen(!open);
  }

  const closeFunc = () => {
    refetch();
    triggerFunc();
  }

  const handleArchivedChange = () => {
    setShowArchived(!showArchived);
  }

  return (
    <Grid style={{"width":"100%"}}>
      <Grid.Row columns={4} padded="true">
        <ModalAddInstructorCourse
            open={ open }
            closeFunc={ closeFunc }/>
        {
          data && data.currentUser.courseUsers &&
          data.currentUser.courseUsers.edges.map(courseUser => (
            !courseUser.node.course.archived && courseUser.node.kind != "STUDENT" &&
            <Grid.Column>
              <CourseCard
                name={courseUser.node.course.name}
                department={courseUser.node.course.department}
                description={courseUser.node.course.description}
                totalQueues={0}
                openQueues={0}
              />
            </Grid.Column>
          ))
        }
        <Grid.Column>
          <AddCard clickFunc={ triggerFunc }/>
        </Grid.Column>
      </Grid.Row>

      {/* ARCHIVED CARDS */}
      <a style={{"textDecoration":"underline", "cursor":"pointer"}} onClick={ handleArchivedChange }>
            { showArchived ? "Hide Archived Courses" : "See Archived Courses"}
      </a>
      <Grid.Row columns={4} padded="true">
        {
          data && data.currentUser.courseUsers && showArchived &&
          data.currentUser.courseUsers.edges.map(courseUser => (
            courseUser.node.course.archived && courseUser.node.kind != "STUDENT" &&
            <Grid.Column>
              <ArchivedCourseCard
                name={courseUser.node.course.name}
                department={courseUser.node.course.department}
                description={courseUser.node.course.description}
                year={courseUser.node.course.year}
              />
            </Grid.Column>
          ))
        }
    </Grid.Row>
    </Grid>
  );
}

export default InstructorCourses;
