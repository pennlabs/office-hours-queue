import React from "react";
import { Modal, Button } from "semantic-ui-react";

import _ from "./VerificationModal.module.css";
import VerificationForm from "./VerificationForm";
import { Toast } from "../../../types";

interface VerificationModalProps {
    open: boolean;
    openFunc: React.Dispatch<React.SetStateAction<boolean>>;
    toastFunc: (Toast) => void;
    mutate: any; // TODO: make this more strict
}
const VerificationModal = (props: VerificationModalProps) => {
    return (
        <Modal open={props.open}>
            <Modal.Header>Phone Number Verification</Modal.Header>
            <Modal.Content>
                <VerificationForm {...props} />
            </Modal.Content>
            <Modal.Actions>
                <Button
                    content="Cancel"
                    onClick={() => props.openFunc(false)}
                />
            </Modal.Actions>
        </Modal>
    );
};

export default VerificationModal;
