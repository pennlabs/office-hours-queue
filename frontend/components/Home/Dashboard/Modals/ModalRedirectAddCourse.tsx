import React, { useState } from "react";
import { Button, Modal } from "semantic-ui-react";
import useSWR from "swr";
import { joinCourse } from "../../../../hooks/data-fetching/dashboard";
import { useCourse } from "../../../../hooks/data-fetching/course";
import { Course } from "../../../../types";

interface ModalRedirectAddCourseProps {
    course: Course;
}

const ModalRedirectAddCourse = (props: ModalRedirectAddCourseProps) => {
    const { course } = props;
    const [open, setOpen] = useState(true);

    const onJoin = async () => {
        setOpen(false);
        await joinCourse(`${course.id}`);
    };

    return (
        <div>
            <Modal size="mini" open={open}>
                <Modal.Header>Do you want to join this course?</Modal.Header>
                <Modal.Content>
                    {course.department} {course.courseCode}:{" "}
                    {course.courseTitle}
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={onJoin} color="blue">
                        Join
                    </Button>
                </Modal.Actions>
            </Modal>
        </div>
    );
};

export default ModalRedirectAddCourse;
