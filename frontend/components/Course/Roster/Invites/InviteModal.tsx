import React, { useState } from "react";
import { Modal, Button } from "semantic-ui-react";
import AddForm from "./AddForm";
import { sendMassInvites } from "../../../../hooks/data-fetching/course";

interface InviteModalProps {
    courseId: number;
    open: boolean;
    closeFunc: () => void;
    successFunc: () => void;
    setToast: React.Dispatch<React.SetStateAction<any>>; // TODO: restrict this
}

enum InviteKind {
    PROFESSOR = "PROFESSOR",
    HEADTA = "HEAD_TA",
    TA = "TA",
    STUDENT = "STUDENT",
}

// TODO: This hasn't been handled
interface InviteState {
    emails: string[];
    kind: InviteKind;
}

const InviteModal = (props: InviteModalProps) => {
    const { courseId, open, closeFunc, successFunc, setToast } = props;
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState<InviteState>({
        emails: [],
        kind: InviteKind.PROFESSOR,
    });
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
            // TODO: Not quite sure what backend expects here, fix
            await sendMassInvites(courseId, input.emails.join(""), input.kind);
            setLoading(false);
            closeFunc();
            successFunc();
        } catch (e) {
            setLoading(false);
            setToast({
                open: true,
                success: false,
                message: e.message.includes("Course cannot have more than")
                    ? "Course cannot have more than 1000 users"
                    : e.message,
            });
        }
    };

    return (
        <Modal open={open}>
            <Modal.Header>Invite User</Modal.Header>
            <Modal.Content>
                <AddForm changeFunc={handleInputChange} />
            </Modal.Content>
            <Modal.Actions>
                <Button
                    content="Cancel"
                    disabled={loading}
                    onClick={closeFunc}
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
