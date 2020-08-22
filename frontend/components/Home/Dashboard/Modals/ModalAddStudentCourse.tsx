import React, { useState } from "react";
import { Modal, Button } from "semantic-ui-react";
import AddStudentForm from "../Forms/AddStudentForm";
import { joinCourse } from "../../../../hooks/data-fetching/dashboard";
import { mutateFunction, Membership } from "../../../../types";

interface ModalAddStudentCourseProps {
    open: boolean;
    closeFunc: () => void;
    mutate: mutateFunction<Membership[]>;
    successFunc: React.Dispatch<React.SetStateAction<boolean>>;
}
const ModalAddStudentCourse = (props: ModalAddStudentCourseProps) => {
    const { open, closeFunc, mutate, successFunc } = props;
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState({ courseIds: [] });
    const [disabled, setDisabled] = useState(true);

    const handleInputChange = (e, { name, value }) => {
        input[name] = value;
        setInput(input);
        setDisabled(input.courseIds.length === 0);
    };

    const joinFunc = async () => {
        if (input.courseIds.length === 0) {
            return;
        }
        setLoading(true);
        const joinCoursesPromise = input.courseIds.map((id) => {
            return joinCourse(id);
        });
        await Promise.all(joinCoursesPromise);
        setLoading(false);
        mutate();
        closeFunc();
        successFunc(true); // trigger snackbar
    };

    return (
        <Modal open={open}>
            <Modal.Header>Join Courses</Modal.Header>
            <Modal.Content>
                <AddStudentForm changeFunc={handleInputChange} />
            </Modal.Content>
            <Modal.Actions>
                <Button
                    content="Cancel"
                    disabled={loading}
                    onClick={closeFunc}
                />
                <Button
                    content="Join"
                    color="blue"
                    disabled={loading || disabled}
                    loading={loading}
                    onClick={joinFunc}
                />
            </Modal.Actions>
        </Modal>
    );
};

export default ModalAddStudentCourse;
