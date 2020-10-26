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

enum ToastType {
    COURSE_ADDED = "Added",
    COURSE_LEFT = "Left",
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

    const updateToast = (toastType: ToastType, { message, success }: Toast) => {
        toast.success = success;
        toast.message = success
            ? `${toastType} ${message}!`
            : "There was an error!";
        setToast(toast);
        setToastOpen(true);
    };

    return (
        <>
            <Grid.Row padded="true">
                <ModalLeaveStudentCourse
                    open={openLeave}
                    leaveMembership={leaveMembership}
                    closeFunc={() => setOpenLeave(false)}
                    mutate={mutate}
                    toastFunc={(leaveToast: Toast) =>
                        updateToast(ToastType.COURSE_LEFT, leaveToast)
                    }
                />
                <ModalAddStudentCourse
                    open={open}
                    closeFunc={() => setOpen(false)}
                    mutate={mutate}
                    toastFunc={(addToast: Toast) =>
                        updateToast(ToastType.COURSE_ADDED, addToast)
                    }
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
