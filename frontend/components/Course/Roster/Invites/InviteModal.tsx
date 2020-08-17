import React, { useState } from "react";
import { Modal, Button } from "semantic-ui-react";
import AddForm from "./AddForm";
import { sendMassInvites } from "../../CourseRequests";

const InviteModal = props => {
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState({ emails: null, kind: null });
    const [disabled, setDisabled] = useState(true);

    const handleInputChange = (e, { name, value }) => {
        input[name] = value;
        setInput(input);
        setDisabled(input.emails.length === 0 || input.kind === null);
    };

    const inviteFunc = async () => {
        if (input.emails.length === 0 || input.kind === null) {
            return;
        }
        try {
            setLoading(true);
            await sendMassInvites(props.courseId, input.emails, input.kind);
            setLoading(false);
            props.closeFunc();
            props.successFunc();
        } catch (e) {
            setLoading(false);
            props.setToast({
                open: true,
                success: false,
                message: e.message.includes("Course cannot have more than")
                    ? "Course cannot have more than 1000 users"
                    : e.message,
            });
        }
    };

    return (
        <Modal open={props.open}>
            <Modal.Header>Invite User</Modal.Header>
            <Modal.Content>
                <AddForm
                    users={props.users}
                    changeFunc={handleInputChange}
                    setToast={props.setToast}
                />
            </Modal.Content>
            <Modal.Actions>
                <Button
                    content="Cancel"
                    disabled={loading}
                    onClick={props.closeFunc}
                />
                <Button
                    content="Invite"
                    color="blue"
                    disabled={loading || disabled}
                    loading={loading}
                    onClick={inviteFunc}
                />
            </Modal.Actions>
        </Modal>
    );
};

export default InviteModal;
