import React, { useState } from "react";
import { Modal, List, Button } from "semantic-ui-react";
import { mutateResourceListFunction, Queue } from "../../../types";
import { clearQueue } from "../../../hooks/data-fetching/course";

interface ClearQueueModalProps {
    queue: Queue;
    courseId: number;
    queueId: number;
    mutate: mutateResourceListFunction<Queue>;
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
            await setRefetchLoading(true);
            await clearQueue(courseId, queueId);
            await setRefetchLoading(false);
            closeFunc();
        } catch (e) {
            await setRefetchLoading(false);
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
                    Doing so will:
                    <List ordered>
                        <List.Item>Reject all pending questions.</List.Item>
                        <List.Item>
                            Finish all questions currently being answered.
                        </List.Item>
                    </List>
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
