import React, { useState } from "react";
import { Modal, List, Button } from "semantic-ui-react";
import { mutateResourceListFunction, Queue, Question } from "../../../types";
import { clearQueue } from "../../../hooks/data-fetching/course";
import { logException } from "../../../utils/sentry";

interface ClearQueueModalProps {
    queue: Queue;
    courseId: number;
    queueId: number;
    mutate: mutateResourceListFunction<Question>;
    closeFunc: () => void;
    open: boolean;
}
const ClearQueueModal = (props: ClearQueueModalProps) => {
    const { courseId, queueId, mutate, closeFunc, open, queue } = props;
    const [mutateLoading, setRefetchLoading] = useState(false);
    const loading = false;

    const onSubmit = async () => {
        // firebase.analytics.logEvent("queue_clear");
        try {
            setRefetchLoading(true);
            await clearQueue(courseId, queueId);
            setRefetchLoading(false);
            mutate(-1, null);
            closeFunc();
        } catch (e) {
            logException(e);
            setRefetchLoading(false);
        }
    };

    return (
        <Modal open={open}>
            <Modal.Header content="Clear Queue" />
            <Modal.Content>
                <div>
                    You are about to clear all remaining questions on{" "}
                    <b>{queue.name}</b>.<br />
                    <br />
                    Doing so will reject all pending questions.
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button
                    content="Cancel"
                    disabled={loading || mutateLoading}
                    onClick={() => props.closeFunc()}
                />
                <Button
                    color="red"
                    content="Clear"
                    disabled={loading || mutateLoading}
                    loading={loading || mutateLoading}
                    onClick={onSubmit}
                />
            </Modal.Actions>
        </Modal>
    );
};

export default ClearQueueModal;
