import React from "react";
import { Modal, Button } from "semantic-ui-react";

import "./VerificationModal.module.css";
import VerificationForm from "./VerificationForm";

interface VerificationModalProps {
    open: boolean;
    openFunc: React.Dispatch<React.SetStateAction<boolean>>;
    toastFunc: (Toast) => void;
    mutate: any; // TODO: make this more strict
}
const VerificationModal = (props: VerificationModalProps) => {
    const { open, openFunc } = props;
    return (
        <Modal open={open}>
            <Modal.Header>Phone Number Verification</Modal.Header>
            <Modal.Content>
                {/* TODO: Is there a way to make this more strict */}
                {/* eslint-disable-next-line */}
                <VerificationForm {...props} />
            </Modal.Content>
            <Modal.Actions>
                <Button content="Cancel" onClick={() => openFunc(false)} />
            </Modal.Actions>
        </Modal>
    );
};

export default VerificationModal;
