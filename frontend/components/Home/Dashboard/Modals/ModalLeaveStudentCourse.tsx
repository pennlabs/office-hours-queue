import React from "react";
import { Modal, Button } from "semantic-ui-react";
import { leaveCourse } from "../../../../hooks/data-fetching/dashboard";
import { mutateFunction, UserMembership } from "../../../../types";

interface ModalLeaveStudentCourseProps {
    open: boolean;
    leaveMembership?: UserMembership;
    closeFunc: () => void;
    mutate: mutateFunction<UserMembership[]>;
}

const ModalLeaveStudentCourse = (props: ModalLeaveStudentCourseProps) => {
    const { open, leaveMembership, closeFunc, mutate } = props;

    const leaveFunc = async () => {
        await leaveCourse(
            `${leaveMembership?.course.id}`,
            `${leaveMembership?.id}`
        );
        mutate();
        closeFunc();
    };

    return leaveMembership ? (
        <Modal size="mini" open={open}>
            <Modal.Header>Leave Course</Modal.Header>
            <Modal.Content>{`Are you sure you want to leave ${leaveMembership.course.department} ${leaveMembership.course.courseCode}?`}</Modal.Content>
            <Modal.Actions>
                <Button content="Cancel" onClick={closeFunc} />
                <Button negative content="Leave" onClick={leaveFunc} />
            </Modal.Actions>
        </Modal>
    ) : (
        <></>
    );
};

export default ModalLeaveStudentCourse;
