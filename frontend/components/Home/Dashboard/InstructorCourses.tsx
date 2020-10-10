import React, { useState } from "react";
import { Grid, Segment, Button } from "semantic-ui-react";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import CourseCard from "./Cards/CourseCard";
import ArchivedCourseCard from "./Cards/ArchivedCourseCard";
import AddCard from "./Cards/AddCard";
import ModalAddInstructorCourse from "./Modals/ModalAddInstructorCourse";
import { Course, mutateFunction, UserMembership, Toast } from "../../../types";

interface InstructorCoursesProps {
    courses: Course[];
    mutate: mutateFunction<UserMembership[]>;
    canCreateCourse: boolean;
}
const InstructorCourses = (props: InstructorCoursesProps) => {
    /* STATE */
    const [open, setOpen] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const { courses, mutate, canCreateCourse } = props;
    const [toast, setToast] = useState<Toast>({ success: true, message: "" });
    const [toastOpen, setToastOpen] = useState(false);

    const handleArchivedChange = () => {
        setShowArchived(!showArchived);
    };

    const updateToast = ({ message, success }: Toast) => {
        toast.success = success;
        toast.message = success ? `${message} created!` : "There was an error!";
        setToast(toast);
        setToastOpen(true);
    };

    return (
        <>
            <Grid.Row padded="true">
                <ModalAddInstructorCourse
                    open={open}
                    closeFunc={() => setOpen(false)}
                    toastFunc={updateToast}
                    mutate={mutate}
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
                {canCreateCourse && (
                    <Grid.Column style={{ width: "280px" }}>
                        <AddCard
                            clickFunc={() => setOpen(true)}
                            isStudent={false}
                        />
                    </Grid.Column>
                )}
            </Grid.Row>
            {courses.filter((course) => course.archived).length > 0 && (
                <Grid.Row padded="true">
                    <Grid.Column padded="true">
                        <Segment basic compact>
                            <Button
                                color="blue"
                                content={
                                    showArchived
                                        ? "Hide Archived"
                                        : "Show Archived"
                                }
                                onClick={handleArchivedChange}
                                icon={showArchived ? "angle up" : "angle down"}
                            />
                        </Segment>
                    </Grid.Column>
                </Grid.Row>
            )}
            <Grid.Row padded="true" style={{ width: "280px" }}>
                {courses.map(
                    (course) =>
                        course.archived &&
                        showArchived && (
                            <Grid.Column style={{ width: "280px" }}>
                                <ArchivedCourseCard course={course} />
                            </Grid.Column>
                        )
                )}
            </Grid.Row>

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
            </Snackbar>
        </>
    );
};

export default InstructorCourses;
