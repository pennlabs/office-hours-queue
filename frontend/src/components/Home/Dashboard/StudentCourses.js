import React, { useState, useEffect } from 'react';
import { Grid } from 'semantic-ui-react';
import CourseCard from './Cards/CourseCard';
import AddCard from './Cards/AddCard';
import ModalAddStudentCourse from './Modals/ModalAddStudentCourse';

/* FUNCTIONAL COMPONENT */
const StudentCourses = (props) => {
  /* STATE */
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState(props.courses);
  
  /* OPENING/CLOSING MODAL */
  const triggerFunc = () => {
    setOpen(!open);
  }

  /* CLOSING MODAL AND REFECTHING DATA */
  const closeFunc = () => {
    props.refetch();
    triggerFunc();
  }

  useEffect(() => {
    setCourses(props.courses);
  }, [props.courses])

  return (
    <Grid style={{"width":"100%"}}>
    <Grid.Row columns={4} padded="true">
      <ModalAddStudentCourse
          open={ open }
          closeFunc={ closeFunc }/>
        {
          courses.map(course => (
            <Grid.Column>
              <CourseCard
                name={course.name}
                department={course.department}
                description={course.description}
                semester={course.semester}
                year={course.year}
                id={course.id}
                kind={course.kind}
                archived={course.archived}/>
            </Grid.Column>
          ))
        }
      <Grid.Column>
        <AddCard clickFunc={ triggerFunc }/>
      </Grid.Column>
    </Grid.Row>
    </Grid>
  );
}

export default StudentCourses;
