import React, { useState } from "react";
import { Button, Modal } from "semantic-ui-react";
import { mutate } from "swr";
import { joinCourse } from "../../../../hooks/data-fetching/dashboard";
import { Course, Toast } from "../../../../types";
import { logException } from "../../../../utils/sentry";

interface ModalRedirectAddCourseProps {
    course: Course;
    toastFunc: (toast: Toast) => void;
}

const ModalRedirectAddCourse = (props: ModalRedirectAddCourseProps) => {
    const { course, toastFunc } = props;
    const [open, setOpen] = useState(true);

    const onJoin = async () => {
        setOpen(false);
        try {
            await joinCourse(`${course.id}`);
            mutate("/accounts/me/");
            toastFunc({
                message: `Added ${course.department} ${course.courseCode}!`,
                success: true,
            });
        } catch (e) {
            logException(e);
            toastFunc({ message: "Something went wrong!", success: false });
        }
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
