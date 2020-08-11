import React, { useState } from "react";
import { Modal, Button } from "semantic-ui-react";
import AddStudentForm from "../Forms/AddStudentForm";
import { joinCourse } from "../DashboardRequests";

const ModalAddStudentCourse = (props) => {
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
        for (let index = 0; index < input.courseIds.length; index++) {
            await joinCourse(input.courseIds[index]);
        }
        setLoading(false);
        props.refetch();
        props.closeFunc();
        props.successFunc(true); // trigger snackbar
    };

    return (
        <Modal open={props.open}>
            <Modal.Header>Join Courses</Modal.Header>
            <Modal.Content>
                <AddStudentForm changeFunc={handleInputChange} />
            </Modal.Content>
            <Modal.Actions>
                <Button
                    content="Cancel"
                    disabled={loading}
                    onClick={props.closeFunc}
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
