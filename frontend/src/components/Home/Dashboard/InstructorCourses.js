import React, { useState, useEffect } from 'react';
import { Grid, Segment, Button } from 'semantic-ui-react';
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
  const [toast, setToast] = useState({ success: true, message: "" });
  const [toastOpen, setToastOpen] = useState(false);

  const handleArchivedChange = () => {
    setShowArchived(!showArchived);
  };

  const updateToast = (name, success) => {
    toast.success = success;
    toast.message = success ? `${name} created!` : "There was an error!"
    setToast(toast);
    setToastOpen(true);
  }

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
          toastFunc={ updateToast }
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
                kind={course.kind}
                courseUserId={course.courseUserId}/>
            </Grid.Column>
          ))
        }
        <Grid.Column>
          <AddCard clickFunc={ () => setOpen(true) }/>
        </Grid.Column>
      </Grid.Row>
        {
          courses.filter(course => course.archived).length > 0 &&
          <Grid.Row padded="true">
            <Grid.Column padded="true">
              <Segment basic compact>
                <Button color="blue"
                  content={ showArchived ? "Hide Archived" : "Show Archived" }
                  onClick={ handleArchivedChange }
                  icon={ showArchived ? "angle up" : "angle down" }/>
              </Segment>
            </Grid.Column>
          </Grid.Row>
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
      <Snackbar open={ toastOpen } autoHideDuration={6000} onClose={ () => setToastOpen(false) }>
        <Alert severity={ toast.success ? 'success' : 'error' } onClose={ () => setToastOpen(false) }>
          <span>{ toast.message }</span>
        </Alert>
      </Snackbar>
    </Grid>
  );
}

export default InstructorCourses;
