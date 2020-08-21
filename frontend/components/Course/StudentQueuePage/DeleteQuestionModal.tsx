import React from "react";
import { Modal, Segment, Button } from "semantic-ui-react";
import {
    Question,
    Queue,
    mutateResourceListFunction,
    QuestionStatus,
} from "../../../types";

interface DeleteQuestionModalProps {
    question: Question;
    queue: Queue;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    mutate: mutateResourceListFunction<Question>;
    toastFunc: (success: string, error: any) => void;
}

const DeleteQuestionModal = (props: DeleteQuestionModalProps) => {
    const { question } = props;
    const { queue } = props;

    const onDelete = async () => {
        try {
            await props.mutate(question.id, {
                status: QuestionStatus.WITHDRAWN,
            });
            props.setOpen(false);
            props.toastFunc("Question withdrawn!", null);
        } catch (e) {
            props.setOpen(false);
            props.toastFunc(null, e);
        }
    };

    return (
        <Modal open={props.open}>
            <Modal.Header>Withdraw Question</Modal.Header>
            <Modal.Content>
                You are about to withdraw your question from <b>{queue.name}</b>
                :<br />
                <Segment inverted color="red">{`"${question.text}"`}</Segment>
                <b>
                    Once you withdraw from the queue, you cannot regain your
                    spot!
                </b>
            </Modal.Content>
            <Modal.Actions>
                <Button
                    content="Cancel"
                    onClick={() => {
                        props.setOpen(false);
                    }}
                />
                <Button content="Withdraw" color="red" onClick={onDelete} />
            </Modal.Actions>
        </Modal>
    );
};

export default DeleteQuestionModal;
