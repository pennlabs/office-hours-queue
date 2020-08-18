import React, { useState } from "react";
import { Modal, List, Button } from "semantic-ui-react";
import { mutateResourceListFunction, Queue } from "../../../types";
import { clearQueue } from "../../../hooks/data-fetching/course";

interface ClearQueueModalProps {
    queue: Queue;
    courseId: number;
    queueId: number;
    refetch: mutateResourceListFunction<Queue>;
    closeFunc: () => void;
    open: boolean;
}
const ClearQueueModal = (props: ClearQueueModalProps) => {
    const { courseId, queueId, refetch, closeFunc, open, queue } = props;
    const [refetchLoading, setRefetchLoading] = useState(false);
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
                    disabled={loading || refetchLoading}
                    onClick={() => props.closeFunc()}
                />
                <Button
                    color="red"
                    content="Clear"
                    disabled={loading || refetchLoading}
                    loading={loading || refetchLoading}
                    onClick={onSubmit}
                />
            </Modal.Actions>
        </Modal>
    );
};

export default ClearQueueModal;
