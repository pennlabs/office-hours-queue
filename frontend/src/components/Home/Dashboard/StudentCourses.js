import React, { useState, useEffect } from 'react';
import { Grid } from 'semantic-ui-react';
import CourseCard from './Cards/CourseCard';
import AddCard from './Cards/AddCard';
import ModalAddStudentCourse from './Modals/ModalAddStudentCourse';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

/* FUNCTIONAL COMPONENT */
const StudentCourses = (props) => {
  /* STATE */
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState(props.courses);
  const [success, setSuccess] = useState(false); //opening snackbar

  useEffect(() => {
    setCourses(props.courses);
  }, [props.courses]);

  return (
    <Grid style={{"width":"100%"}} stackable>
      <Grid.Row columns={4} padded="true" stackable>
        <ModalAddStudentCourse
            open={ open }
            closeFunc={ () => setOpen(false) }
            refetch={ props.refetch }
            successFunc={ setSuccess }/>
          {
            courses.map((course) => (
              <Grid.Column>
                <CourseCard
                  department={course.department}
                  courseCode={course.courseCode}
                  courseTitle={course.courseTitle}
                  semester={course.semester}
                  year={course.year}
                  id={course.id}
                  kind={course.kind}
                  archived={course.archived}/>
              </Grid.Column>
            ))
          }
        <Grid.Column>
          <AddCard clickFunc={ () => setOpen(true) }/>
        </Grid.Column>
      </Grid.Row>
      <Snackbar open={ success } autoHideDuration={2000} onClose={ () => setSuccess(false) }>
        <Alert severity="success" onClose={ () => setSuccess(false) }>
          Course added!
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default StudentCourses;
