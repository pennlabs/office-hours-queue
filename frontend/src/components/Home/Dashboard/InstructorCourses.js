import React, { useState, useEffect } from 'react';
import { Grid, Segment } from 'semantic-ui-react';
import CourseCard from './Cards/CourseCard';
import ArchivedCourseCard from './Cards/ArchivedCourseCard';
import AddCard from './Cards/AddCard';
import ModalAddInstructorCourse from './Modals/ModalAddInstructorCourse';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

/* FUNCTIONAL COMPONENT */
const InstructorCourses = (props) => {
  /* STATE */
  const [open, setOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [courses, setCourses] = useState(props.courses);
  const [success, setSuccess] = useState(false);

  const handleArchivedChange = () => {
    setShowArchived(!showArchived);
  };

  /* UPDATE ON PROPS CHANGE */
  useEffect(() => {
    setCourses(props.courses);
  }, [props.courses]);

  return (
    <Grid style={{"width":"100%"}} stackable>
      <Grid.Row columns={4} padded="true" stackable>
        <ModalAddInstructorCourse
          open={ open }
          closeFunc={ () => setOpen(false) }
          successFunc={ setSuccess }
          refetch={ props.refetch }/>
        {
          courses.map(course => (
            !course.archived &&
            <Grid.Column>
              <CourseCard
                department={course.department}
                courseCode={course.courseCode}
                courseTitle={course.courseTitle}
                description={course.description}
                semester={course.semester}
                year={course.year}
                id={course.id}
                kind={course.kind}/>
            </Grid.Column>
          ))
        }
        <Grid.Column>
          <AddCard clickFunc={ () => setOpen(true) }/>
        </Grid.Column>
      </Grid.Row>
        {
          courses.filter(course => course.archived).length > 0 &&
          <Segment basic compact>
            <a style={{"textDecoration":"underline", "cursor":"pointer"}} onClick={ handleArchivedChange }>
            { showArchived ? "Hide Archived Courses" : "See Archived Courses"}
            </a>
          </Segment>
        }
      <Grid.Row columns={4} padded="true">
        {
          courses.map(course => (
            course.archived && showArchived &&
            <Grid.Column>
              <ArchivedCourseCard
                department={course.department}
                courseCode={course.courseCode}
                courseTitle={course.courseTitle}
                description={course.description}
                id={course.id}
                semester={course.semester}/>
            </Grid.Column>
          ))
        }
      </Grid.Row>
      <Snackbar open={ success } autoHideDuration={2000} onClose={ () => setSuccess(false) }>
        <Alert severity="success" onClose={ () => setSuccess(false) }>
          Course added!
        </Alert>
      </Snackbar>
    </Grid>
  );
}

export default InstructorCourses;
