import React, { useState, useMemo } from "react";
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
    rateLimitEnabled: boolean;
    rateLimitLength?: number;
    rateLimitQuestions?: number;
    rateLimitMinutes?: number;
}

enum RateLimitFields {
    RATE_LIMIT_QUESTIONS = "rateLimitQuestions",
    RATE_LIMIT_MINUTES = "rateLimitMinutes",
    RATE_LIMIT_LENGTH = "rateLimitLength",
}

const castInt = (n: string): number | undefined => {
    let casted: number | undefined = parseInt(n, 10);
    if (casted === NaN) {
        casted = undefined;
    }

    return casted;
};

const QueueForm = (props: QueueFormProps) => {
    /* STATE */
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const { queue } = props;
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState<QueueFormInput>({
        name: queue.name,
        description: queue.description,
        queueId: queue.id,
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
    });
    const [validQuestionRate, setValidQuestionRate] = useState(true);
    const [validMinsRate, setValidMinsRate] = useState(true);
    const [validLenRate, setValidLenRate] = useState(true);

    const [nameCharCount, setNameCharCount] = useState(input.name.length);
    const [descCharCount, setDescCharCount] = useState(
        input.description.length
    );

    const isDisabled = useMemo(() => {
        let invalidInps = !input.name || !input.description;
        if (input.rateLimitEnabled) {
            invalidInps =
                invalidInps ||
                input.rateLimitLength === undefined ||
                (input.rateLimitLength !== undefined &&
                    input.rateLimitLength < 0);
            invalidInps =
                invalidInps ||
                input.rateLimitQuestions === undefined ||
                (input.rateLimitQuestions !== undefined &&
                    input.rateLimitQuestions <= 0);
            invalidInps =
                invalidInps ||
                input.rateLimitMinutes === undefined ||
                (input.rateLimitMinutes !== undefined &&
                    input.rateLimitMinutes <= 0);
        }

        let isSame =
            input.name === queue.name &&
            input.description === queue.description;
        if (input.rateLimitEnabled !== queue.rateLimitEnabled) {
            isSame = false;
        } else if (input.rateLimitEnabled && queue.rateLimitEnabled) {
            isSame =
                isSame &&
                input.rateLimitLength === queue.rateLimitLength &&
                input.rateLimitQuestions === queue.rateLimitQuestions &&
                input.rateLimitMinutes === queue.rateLimitMinutes;
        }
        return invalidInps || isSame;
        // Queue covers all our cases
        // eslint-disable-next-line
    }, [input, JSON.stringify(queue)]);

    /* HANDLER FUNCTIONS */
    const handleInputChange = (e, { name, value }) => {
        if (name === "description" && value.length > 500) return;
        if (name === "name" && value.length > 100) return;

        input[name] = value;

        if (name === RateLimitFields.RATE_LIMIT_QUESTIONS) {
            input[name] = castInt(input[name]);
            setValidQuestionRate(input[name] > 0);
        }

        if (name === RateLimitFields.RATE_LIMIT_MINUTES) {
            input[name] = castInt(input[name]);
            setValidMinsRate(input[name] > 0);
        }

        if (name === RateLimitFields.RATE_LIMIT_LENGTH) {
            input[name] = castInt(input[name]);
            setValidLenRate(input[name] >= 0);
        }

        setInput({ ...input });
        setDescCharCount(input.description.length);
        setNameCharCount(input.name.length);
    };

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
                            defaultChecked={input.rateLimitEnabled}
                            label="Enable queue rate-limiting"
                            onChange={() =>
                                setInput({
                                    ...input,
                                    rateLimitEnabled: !input.rateLimitEnabled,
                                })
                            }
                        />
                    </Form.Field>

                    {input.rateLimitEnabled && (
                        <Form.Group style={{ alignItems: "center" }}>
                            <Form.Input
                                placeholder="3"
                                name={RateLimitFields.RATE_LIMIT_QUESTIONS}
                                defaultValue={input.rateLimitQuestions}
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
                                name={RateLimitFields.RATE_LIMIT_MINUTES}
                                defaultValue={input.rateLimitMinutes}
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
                                name={RateLimitFields.RATE_LIMIT_LENGTH}
                                defaultValue={input.rateLimitLength}
                                width={2}
                                onChange={handleInputChange}
                                size="mini"
                                type="number"
                                min="0"
                                id="rate-length"
                                error={!validLenRate}
                            />
                            <label htmlFor="rate-length">question(s)</label>
                        </Form.Group>
                    )}

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

export default QueueForm;
