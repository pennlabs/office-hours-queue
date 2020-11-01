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

    // shared toast that displays message for either leaving or adding a course
    const [toastOpen, setToastOpen] = useState(false);
    const [toast, setToast] = useState<Toast>({
        success: true,
        message: "",
    });

    const [openLeave, setOpenLeave] = useState(false);
    const [leaveMembership, setLeaveMembership] = useState<
        UserMembership | undefined
    >(undefined);

    return (
        <>
            <Grid.Row padded="true">
                {leaveMembership && (
                    <ModalLeaveStudentCourse
                        open={openLeave}
                        leaveMembership={leaveMembership}
                        closeFunc={() => setOpenLeave(false)}
                        mutate={mutate}
                        toastFunc={(newToast: Toast) => {
                            setToast(newToast);
                            setToastOpen(true);
                        }}
                    />
                )}
                <ModalAddStudentCourse
                    open={open}
                    closeFunc={() => setOpen(false)}
                    mutate={mutate}
                    toastFunc={(newToast: Toast) => {
                        setToast(newToast);
                        setToastOpen(true);
                    }}
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
                open={toastOpen}
                autoHideDuration={2000}
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

export default StudentCourses;
