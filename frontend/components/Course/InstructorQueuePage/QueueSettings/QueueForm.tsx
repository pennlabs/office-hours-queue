import React, { useState } from "react";
import { Form, Button, Modal } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import { Queue } from "../../../../types";
import { logException } from "../../../../utils/sentry";

// TODO: error check PATCH
interface QueueFormProps {
    queue: Queue;
    mutate: mutateResourceListFunction<Queue>;
    backFunc: () => void;
}

interface QueueFormInput {
    name: string;
    description: string;
    queueId: number;
    rateLimit: {
        enabled: boolean;
        rateLimitLength?: number;
        rateLimitQuestions?: number;
        rateLimitMinutes?: number;
    };
}

const QueueForm = (props: QueueFormProps) => {
    const loading = false;
    /* STATE */
    const [success, setSuccess] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [error, setError] = useState(false);
    const { queue } = props;
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState<QueueFormInput>({
        name: queue.name,
        description: queue.description,
        queueId: queue.id,
        rateLimit:
            queue.rateLimitLength &&
            queue.rateLimitMinutes &&
            queue.rateLimitQuestions
                ? {
                      enabled: true,
                      rateLimitLength: queue.rateLimitLength,
                      rateLimitMinutes: queue.rateLimitMinutes,
                      rateLimitQuestions: queue.rateLimitQuestions,
                  }
                : { enabled: false },
    });
    const [validQuestionRate, setValidQuestionRate] = useState(true);
    const [validMinsRate, setValidMinsRate] = useState(true);
    const [validLenRate, setValidLenRate] = useState(true);

    const [nameCharCount, setNameCharCount] = useState(input.name.length);
    const [descCharCount, setDescCharCount] = useState(
        input.description.length
    );

    /* HANDLER FUNCTIONS */
    const handleInputChange = (e, { name, value }) => {
        if (name === "description" && value.length > 500) return;
        if (name === "name" && value.length > 100) return;
        input[name] = value;

        if (name === "rateLimitQuestions") {
            setValidQuestionRate(value > 0);
        }

        if (name === "rateLimitMinutes") {
            setValidMinsRate(value > 0);
        }

        if (name === "rateLimitLengt") {
            setValidLenRate(value > 0);
        }

        setInput({ ...input });
        setDescCharCount(input.description.length);
        setNameCharCount(input.name.length);
        setDisabled(
            !input.name ||
                !input.description ||
                (input.name === queue.name &&
                    input.description === queue.description)
        );
    };

    const onSubmit = async () => {
        try {
            await props.mutate(queue.id, input);
            setSuccess(true);
        } catch (e) {
            logException(e);
            setError(true);
        }
    };

    const onArchived = async () => {
        await props.mutate(queue.id, { archived: true });
        setOpen(false);
        props.backFunc();
    };

    /* PROPS UPDATE */

    return (
        <Form>
            {queue && (
                <div>
                    <Form.Field>
                        <label htmlFor="form-name">Name</label>
                        <Form.Input
                            id="form-name"
                            defaultValue={input.name}
                            name="name"
                            disabled={loading}
                            onChange={handleInputChange}
                        />
                        <div
                            style={{
                                textAlign: "right",
                                color: nameCharCount < 100 ? "" : "crimson",
                            }}
                        >
                            {`Characters: ${nameCharCount}/100`}
                        </div>
                    </Form.Field>
                    <Form.Field>
                        <label htmlFor="form-desc">Description</label>
                        <Form.Input
                            id="form-desc"
                            defaultValue={input.description}
                            name="description"
                            disabled={loading}
                            onChange={handleInputChange}
                        />
                        <div
                            style={{
                                textAlign: "right",
                                color: descCharCount < 500 ? "" : "crimson",
                            }}
                        >
                            {`Characters: ${descCharCount}/500`}
                        </div>
                    </Form.Field>
                    <Form.Field>
                        <Form.Checkbox
                            name="rateLimitEnabled"
                            defaultChecked={input.rateLimit.enabled}
                            label="Enable queue rate-limiting"
                            onChange={() =>
                                setInput({
                                    ...input,
                                    rateLimit: {
                                        ...input.rateLimit,
                                        enabled: !input.rateLimit.enabled,
                                    },
                                })
                            }
                        />
                    </Form.Field>

                    {input.rateLimit.enabled && (
                        <Form.Group style={{ alignItems: "center" }}>
                            <Form.Input
                                placeholder="3"
                                name="rateLimitQuestions"
                                onChange={handleInputChange}
                                width={2}
                                size="mini"
                                type="number"
                                min="1"
                                id="rate-questions"
                                error={!validQuestionRate}
                            />
                            <label htmlFor="rate-questions">
                                question(s) within{" "}
                            </label>
                            <Form.Input
                                placeholder="60"
                                name="rateLimitMinutes"
                                width={2}
                                size="mini"
                                onChange={handleInputChange}
                                type="number"
                                min="1"
                                id="rate-minutes"
                                error={!validMinsRate}
                            />
                            <label htmlFor="rate-minutes">
                                minutes when queue has at least
                            </label>
                            <Form.Input
                                placeholder="10"
                                name="rateLimitLength"
                                width={2}
                                onChange={handleInputChange}
                                size="mini"
                                type="number"
                                min="1"
                                id="rate-length"
                                error={!validLenRate}
                            />
                            <label htmlFor="rate-length">question(s)</label>
                        </Form.Group>
                    )}

                    <Button
                        color="blue"
                        type="submit"
                        disabled={disabled || loading}
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

export default QueueForm;
