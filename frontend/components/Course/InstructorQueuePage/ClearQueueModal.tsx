import React, { useState } from "react";
import { Modal, List, Button } from "semantic-ui-react";
import { clearQueue as sendClearQueue } from "../CourseRequests";
// import { gql } from "apollo-boost";
// import { useMutation } from "@apollo/react-hooks";
// import firebase from "../../Firebase";
import { mutateFunction, Queue } from "../../../types";

// const CLEAR_QUEUE = gql`
//   mutation ClearQueue($input: ClearQueueInput!) {
//     clearQueue(input: $input) {
//       success
//     }
//   }
// `;

interface ClearQueueModalProps {
    queue: Queue;
    courseId: number;
    queueId: number;
    refetch: mutateFunction<Queue>;
    closeFunc: () => void;
    open: boolean;
}
const ClearQueueModal = (props: ClearQueueModalProps) => {
    const { courseId, queueId, refetch, closeFunc, open, queue } = props;
    const clearQueue = () => sendClearQueue(courseId, queueId);
    const [refetchLoading, setRefetchLoading] = useState(false);
    const loading = false;

    const onSubmit = async () => {
        // firebase.analytics.logEvent("queue_clear");
        try {
            await clearQueue();
            await setRefetchLoading(true);
            await refetch();
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
