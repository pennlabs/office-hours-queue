import React, { useState } from "react";
import { Grid } from "semantic-ui-react";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import CourseCard from "./Cards/CourseCard";
import AddCard from "./Cards/AddCard";
import ModalAddStudentCourse from "./Modals/ModalAddStudentCourse";
import { Course, mutateFunction, UserMembership } from "../../../types";

interface StudentCoursesProps {
    courses: Course[];
    mutate: mutateFunction<UserMembership[]>;
}

const StudentCourses = (props: StudentCoursesProps) => {
    const { mutate, courses } = props;
    /* STATE */
    const [open, setOpen] = useState(false);
    const [success, setSuccess] = useState(false); // opening snackbar

    return (
        <>
            <Grid.Row padded="true" stackable>
                <ModalAddStudentCourse
                    open={open}
                    closeFunc={() => setOpen(false)}
                    mutate={mutate}
                    successFunc={setSuccess}
                />
                {courses.map(
                    (course) =>
                        !course.archived && (
                            <Grid.Column
                                key={course.id}
                                style={{ width: "280px" }}
                            >
                                <CourseCard course={course} />
                            </Grid.Column>
                        )
                )}
                <Grid.Column style={{ width: "280px" }}>
                    <AddCard clickFunc={() => setOpen(true)} isStudent={true} />
                </Grid.Column>
            </Grid.Row>

            <Snackbar
                open={success}
                autoHideDuration={2000}
                onClose={() => setSuccess(false)}
            >
                <Alert severity="success" onClose={() => setSuccess(false)}>
                    Course added!
                </Alert>
            </Snackbar>
        </>
    );
};

export default StudentCourses;
