import React, { useState } from "react";
import { Grid } from "semantic-ui-react";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import CourseCard from "./Cards/CourseCard";
import AddCard from "./Cards/AddCard";
import ModalAddStudentCourse from "./Modals/ModalAddStudentCourse";
import ModalLeaveStudentCourse from "./Modals/ModalLeaveStudentCourse";
import { mutateFunction, Toast, UserMembership } from "../../../types";

interface StudentCoursesProps {
    memberships: UserMembership[];
    mutate: mutateFunction<UserMembership[]>;
}

const StudentCourses = (props: StudentCoursesProps) => {
    const { mutate, memberships } = props;
    /* STATE */
    const [open, setOpen] = useState(false);
    const [addToastOpen, setAddToastOpen] = useState(false); // opening snackbar

    const [openLeave, setOpenLeave] = useState(false);
    const [leaveMembership, setLeaveMembership] = useState<
        UserMembership | undefined
    >(undefined);

    const [leaveToastOpen, setLeaveToastOpen] = useState(false);
    const [leaveToast, setLeaveToast] = useState<Toast>({
        success: true,
        message: "",
    });

    const updateLeaveToast = ({ message, success }: Toast) => {
        leaveToast.success = success;
        leaveToast.message = success
            ? `Left ${message}!`
            : "There was an error!";
        setLeaveToast(leaveToast);
        setLeaveToastOpen(true);
    };

    return (
        <>
            <Grid.Row padded="true">
                <ModalLeaveStudentCourse
                    open={openLeave}
                    leaveMembership={leaveMembership}
                    closeFunc={() => setOpenLeave(false)}
                    mutate={mutate}
                    toastFunc={updateLeaveToast}
                />
                <ModalAddStudentCourse
                    open={open}
                    closeFunc={() => setOpen(false)}
                    mutate={mutate}
                    successFunc={setAddToastOpen}
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
                open={leaveToastOpen}
                autoHideDuration={2000}
                onClose={() => setLeaveToastOpen(false)}
            >
                <Alert
                    severity={leaveToast.success ? "success" : "error"}
                    onClose={() => setLeaveToastOpen(false)}
                >
                    <span>{leaveToast.message}</span>
                </Alert>
            </Snackbar>

            <Snackbar
                open={addToastOpen}
                autoHideDuration={2000}
                onClose={() => setAddToastOpen(false)}
            >
                <Alert
                    severity="success"
                    onClose={() => setAddToastOpen(false)}
                >
                    Course added!
                </Alert>
            </Snackbar>
        </>
    );
};

export default StudentCourses;
