import React from "react";
import { Modal, Button } from "semantic-ui-react";
import { mutateResourceFunction } from "@pennlabs/rest-hooks/dist/types";
import { leaveCourse } from "../../../../hooks/data-fetching/dashboard";
import { Toast, UserMembership } from "../../../../types";
import { logException } from "../../../../utils/sentry";

interface ModalLeaveStudentCourseProps {
    open: boolean;
    leaveMembership: UserMembership;
    closeFunc: () => void;
    mutate: mutateResourceFunction<UserMembership[]>;
    toastFunc: (toast: Toast) => void;
}
const ModalLeaveStudentCourse = (props: ModalLeaveStudentCourseProps) => {
    const { open, leaveMembership, closeFunc, mutate, toastFunc } = props;

    const leaveFunc = async () => {
        try {
            await leaveCourse(
                `${leaveMembership.course.id}`,
                `${leaveMembership.id}`
            );
            toastFunc({
                message: `Left ${leaveMembership.course.department} ${leaveMembership.course.courseCode}!`,
                success: true,
            });
        } catch (e) {
            logException(e);
            toastFunc({ message: "Something went wrong!", success: false });
        }
        mutate();
        closeFunc();
    };

    return (
        <Modal size="mini" open={open}>
            <Modal.Header>Leave Course</Modal.Header>
            <Modal.Content>{`Are you sure you want to leave ${leaveMembership.course.department} ${leaveMembership.course.courseCode}?`}</Modal.Content>
            <Modal.Actions>
                <Button content="Cancel" onClick={closeFunc} />
                <Button negative content="Leave" onClick={leaveFunc} />
            </Modal.Actions>
        </Modal>
    );
};

export default ModalLeaveStudentCourse;
