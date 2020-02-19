import React, { useState, useEffect } from 'react';
import { Grid } from 'semantic-ui-react';
import CourseCard from './Cards/CourseCard';
import ArchivedCourseCard from './Cards/ArchivedCourseCard';
import AddCard from './Cards/AddCard';
import ModalAddInstructorCourse from './Modals/ModalAddInstructorCourse';

/* FUNCTIONAL COMPONENT */
const InstructorCourses = (props) => {
  /* STATE */
  const [open, setOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [courses, setCourses] = useState(props.courses);
  
  /* HANDLER FUNCTIONS */
  const triggerFunc = () => {
    setOpen(!open);
  }

  const closeFunc = () => {
    props.refetch();
    triggerFunc();
  }

  const handleArchivedChange = () => {
    setShowArchived(!showArchived);
  }

  /* UPDATE ON PROPS CHANGE */
  useEffect(() => {
    setCourses(props.courses);
  }, [props.courses])

  return (
    <Grid style={{"width":"100%"}}>
      <Grid.Row columns={4} padded="true">
        <ModalAddInstructorCourse
            open={ open }
            closeFunc={ closeFunc }/>
        {
          courses.map(course => (
            !course.archived &&
            <Grid.Column>
              <CourseCard
                name={ course.name }
                department={ course.department }
                description={ course.description }
                semester={ course.semester }
                year={ course.year }
                id={ course.id }
                kind={ course.kind }
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
          courses.map(course => (
            course.archived && showArchived &&
            <Grid.Column>
              <ArchivedCourseCard
                name={ course.name }
                department={ course.department }
                description={ course.description }
                id={ course.id }
                year={ course.year }
                totalQueues={0}
                openQueues={0}
              />
            </Grid.Column>
          ))
        }
    </Grid.Row>
    </Grid>
  );
}

export default InstructorCourses;
