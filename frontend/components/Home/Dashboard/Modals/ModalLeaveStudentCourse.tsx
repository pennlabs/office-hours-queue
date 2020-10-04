import React, { useState } from 'react';
import { Modal, Button } from 'semantic-ui-react';

import { Course } from "../../../../types";

interface ModalLeaveStudentCourseProps {
    open: boolean;
    course: Course;
    closeFunc: () => void;
}

const ModalLeaveStudentCourse = (props: ModalLeaveStudentCourseProps) => {
    const { open, course, closeFunc } = props;
    return (
        <Modal
            size="mini"
            open={open}
        >
            <Modal.Header>Leave Course</Modal.Header>
            <Modal.Content>{`Are you sure you want to leave ${course.department} ${course.courseCode}?`}</Modal.Content>
            <Modal.Actions>
                <Button content="Cancel" onClick={closeFunc}/>
                <Button negative content="Leave" onClick={() => {}}/>
            </Modal.Actions>
        </Modal>
    )
}

export default ModalLeaveStudentCourse;