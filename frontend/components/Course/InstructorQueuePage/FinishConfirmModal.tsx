import { Button, Modal } from "semantic-ui-react";

interface FinishConfirmModalProps {
    finishFunc: () => void;
    closeFunc: () => void;
    open: boolean;
}

const FinishConfirmModal = (props: FinishConfirmModalProps) => {
    const { finishFunc, closeFunc, open } = props;

    return (
        <Modal open={open}>
            <Modal.Header>Finish Confirmation</Modal.Header>
            <Modal.Content>
                <Modal.Description>
                    You are about to finish a question that you did not start.
                    Is this intended?
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button content="Cancel" onClick={closeFunc} />
                <Button
                    content="Finish"
                    loading={false}
                    color="green"
                    onClick={finishFunc}
                />
            </Modal.Actions>
        </Modal>
    );
};

export default FinishConfirmModal;
