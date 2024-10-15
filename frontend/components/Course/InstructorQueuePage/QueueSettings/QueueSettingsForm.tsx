import { useState } from "react";
import { Form, Button, Modal } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import { Queue } from "../../../../types";
import { logException } from "../../../../utils/sentry";
import QueueFormFields, { QueueFormInput } from "../QueueFormFields";

// TODO: error check PATCH
interface QueueFormProps {
    queue: Queue;
    mutate: mutateResourceListFunction<Queue>;
    backFunc: () => void;
}

const UpdateQueueForm = (props: QueueFormProps) => {
    /* STATE */

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const { queue } = props;
    const [open, setOpen] = useState(false);
    const [isDisabled, setDisabled] = useState(true);
    const [input, setInput] = useState<QueueFormInput>({
        name: queue.name,
        description: queue.description,
        questionTemplate: queue.questionTemplate,
        queueId: queue.id,
        videoChatSetting: queue.videoChatSetting,
        pinEnabled: queue.pinEnabled,
        rateLimitEnabled: queue.rateLimitEnabled,
        rateLimitLength: queue.rateLimitEnabled
            ? queue.rateLimitLength
            : undefined,
        rateLimitMinutes: queue.rateLimitEnabled
            ? queue.rateLimitMinutes
            : undefined,
        rateLimitQuestions: queue.rateLimitEnabled
            ? queue.rateLimitQuestions
            : undefined,
        questionTimerEnabled: queue.questionTimerEnabled,
        questionTimerStartTime: queue.questionTimerEnabled
            ? queue.questionTimerStartTime
            : undefined,
    });

    const onSubmit = async () => {
        try {
            setLoading(true);
            await props.mutate(queue.id, input);
            setSuccess(true);
        } catch (e) {
            logException(e);
            setError(true);
        }
        setLoading(false);
    };

    const onArchived = async () => {
        await props.mutate(queue.id, { archived: true });
        setOpen(false);
        props.backFunc();
    };

    return (
        <Form>
            {queue && (
                <div>
                    <QueueFormFields
                        defaultValues={input}
                        queue={queue}
                        loading={loading}
                        setInput={setInput}
                        setDisabled={setDisabled}
                    />
                    <Button
                        color="blue"
                        type="submit"
                        disabled={isDisabled || loading}
                        loading={loading}
                        onClick={onSubmit}
                    >
                        Save
                    </Button>
                    <Modal
                        open={open}
                        trigger={
                            <Button type="submit" onClick={() => setOpen(true)}>
                                Archive
                            </Button>
                        }
                    >
                        <Modal.Header>Archive Queue</Modal.Header>
                        <Modal.Content>
                            You are about to archive this queue:{" "}
                            <b>{queue.name}</b>.
                        </Modal.Content>
                        <Modal.Actions>
                            <Button
                                content="Cancel"
                                disabled={loading}
                                onClick={() => setOpen(false)}
                            />
                            <Button
                                content="Archive"
                                onClick={onArchived}
                                disabled={loading}
                                color="red"
                            />
                        </Modal.Actions>
                    </Modal>
                </div>
            )}
            <Snackbar
                open={success}
                autoHideDuration={2000}
                onClose={() => setSuccess(false)}
            >
                <Alert severity="success" onClose={() => setSuccess(false)}>
                    <span>
                        <b>{queue.name}</b> successfully updated
                    </span>
                </Alert>
            </Snackbar>
            <Snackbar
                open={error}
                autoHideDuration={6000}
                onClose={() => setError(false)}
            >
                <Alert severity="error" onClose={() => setError(false)}>
                    <span>
                        There was an error editing <b>{queue.name}</b>
                    </span>
                </Alert>
            </Snackbar>
        </Form>
    );
};

export default UpdateQueueForm;
