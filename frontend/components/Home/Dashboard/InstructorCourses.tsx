import React, { useState, useEffect } from "react";
import { Grid, Segment, Button } from "semantic-ui-react";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import CourseCard from "./Cards/CourseCard";
import ArchivedCourseCard from "./Cards/ArchivedCourseCard";
import AddCard from "./Cards/AddCard";
import ModalAddInstructorCourse from "./Modals/ModalAddInstructorCourse";

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
        toast.message = success ? `${name} created!` : "There was an error!";
        setToast(toast);
        setToastOpen(true);
    };

    /* UPDATE ON PROPS CHANGE */
    useEffect(() => {
        setCourses(props.courses);
    }, [props.courses]);

    return [
        <Grid.Row padded="true" stackable>
            <ModalAddInstructorCourse
                open={open}
                closeFunc={() => setOpen(false)}
                toastFunc={updateToast}
                refetch={props.refetch}
            />
            {courses.map(
                (course) =>
                    !course.archived && (
                        <Grid.Column key={course.id} style={{ width: "280px" }}>
                            <CourseCard
                                department={course.department}
                                courseCode={course.courseCode}
                                courseTitle={course.courseTitle}
                                description={course.description}
                                semester={course.semester}
                                id={course.id}
                                kind={course.kind}
                                courseUserId={course.courseUserId}
                            />
                        </Grid.Column>
                    )
            )}
            <Grid.Column style={{ width: "280px" }}>
                <AddCard clickFunc={() => setOpen(true)} />
            </Grid.Column>
        </Grid.Row>,
        courses.filter((course) => course.archived).length > 0 && (
            <Grid.Row padded="true">
                <Grid.Column padded="true">
                    <Segment basic compact>
                        <Button
                            color="blue"
                            content={
                                showArchived ? "Hide Archived" : "Show Archived"
                            }
                            onClick={handleArchivedChange}
                            icon={showArchived ? "angle up" : "angle down"}
                        />
                    </Segment>
                </Grid.Column>
            </Grid.Row>
        ),
        <Grid.Row padded="true" style={{ width: "280px" }}>
            {courses.map(
                (course) =>
                    course.archived &&
                    showArchived && (
                        <Grid.Column style={{ width: "280px" }}>
                            <ArchivedCourseCard
                                department={course.department}
                                courseCode={course.courseCode}
                                courseTitle={course.courseTitle}
                                description={course.description}
                                id={course.id}
                                semester={course.semester}
                            />
                        </Grid.Column>
                    )
            )}
        </Grid.Row>,
        <Snackbar
            open={toastOpen}
            autoHideDuration={6000}
            onClose={() => setToastOpen(false)}
        >
            <Alert
                severity={toast.success ? "success" : "error"}
                onClose={() => setToastOpen(false)}
            >
                <span>{toast.message}</span>
            </Alert>
        </Snackbar>,
    ];
};

export default InstructorCourses;
