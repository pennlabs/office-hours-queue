import React, { useState } from "react";
import { Grid } from "semantic-ui-react";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import CourseCard from "./Cards/CourseCard";
import AddCard from "./Cards/AddCard";
import ModalAddStudentCourse from "./Modals/ModalAddStudentCourse";
import ModalLeaveStudentCourse from "./Modals/ModalLeaveStudentCourse";
import { Course, mutateFunction, UserMembership } from "../../../types";

interface StudentCoursesProps {
    memberships: UserMembership[];
    mutate: mutateFunction<UserMembership[]>;
}

const StudentCourses = (props: StudentCoursesProps) => {
    const { mutate, memberships } = props;
    /* STATE */
    const [open, setOpen] = useState(false);
    const [success, setSuccess] = useState(false); // opening snackbar

    const [openLeave, setOpenLeave] = useState(false);
    const [leaveMembership, setLeaveMembership] = useState<UserMembership | undefined>(undefined);

    return (
        <>
            <Grid.Row padded="true">
                <ModalLeaveStudentCourse
                    open={openLeave}
                    leaveMembership={leaveMembership}
                    closeFunc={() => setOpenLeave(false)}
                    mutate={mutate}
                />
                <ModalAddStudentCourse
                    open={open}
                    closeFunc={() => setOpen(false)}
                    mutate={mutate}
                    successFunc={setSuccess}
                />
                {memberships.map(
                    (membership) =>
                        !membership.course.archived && (
                            <Grid.Column
                                key={membership.course.id}
                                style={{ width: "280px" }}
                            >
                                <CourseCard
                                    membership={membership}
                                    mutate={mutate}
                                    setOpenLeave={setOpenLeave}
                                    setLeaveMembership={setLeaveMembership}
                                />
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
