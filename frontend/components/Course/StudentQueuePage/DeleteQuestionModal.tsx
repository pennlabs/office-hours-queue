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
    queueMutate: mutateResourceListFunction<Queue>;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    mutate: mutateResourceListFunction<Question>;
    toastFunc: (success: string | null, error: any) => void;
}

const DeleteQuestionModal = (props: DeleteQuestionModalProps) => {
    const {
        question,
        queue,
        queueMutate,
        open,
        setOpen,
        mutate,
        toastFunc,
    } = props;

    const onDelete = async () => {
        try {
            await mutate(question.id, {
                status: QuestionStatus.WITHDRAWN,
            });
            queueMutate(-1, null);
            setOpen(false);
            toastFunc("Question withdrawn!", null);
        } catch (e) {
            setOpen(false);
            toastFunc(null, e);
        }
    };

    return (
        <Modal open={open}>
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
                        setOpen(false);
                    }}
                />
                <Button content="Withdraw" color="red" onClick={onDelete} />
            </Modal.Actions>
        </Modal>
    );
};

export default DeleteQuestionModal;
