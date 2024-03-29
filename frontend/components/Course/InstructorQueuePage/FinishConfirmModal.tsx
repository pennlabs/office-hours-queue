import { Button, Modal } from "semantic-ui-react";

interface FinishConfirmModalProps {
    onFinish?: () => void;
    onClose?: () => void;
    open: boolean;
}

const FinishConfirmModal = (props: FinishConfirmModalProps) => {
    const { onFinish, onClose, open } = props;

    return (
        <Modal open={open} onClose={onClose}>
            <Modal.Header>Finish Confirmation</Modal.Header>
            <Modal.Content>
                <Modal.Description>
                    You are about to finish a question that you did not start.
                    Is this intended?
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button content="Cancel" onClick={onClose} />
                <Button
                    content="Finish"
                    loading={false}
                    color="green"
                    onClick={onFinish}
                />
            </Modal.Actions>
        </Modal>
    );
};

export default FinishConfirmModal;
