import { useState, useMemo } from "react";
import { Form, Button, Modal } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import { Queue, VideoChatSetting } from "../../../../types";
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
    questionTemplate: string;
    queueId: number;
    videoChatSetting: VideoChatSetting;
    rateLimitEnabled: boolean;
    rateLimitLength?: number;
    rateLimitQuestions?: number;
    rateLimitMinutes?: number;
    pin?: string;
    pinEnabled: boolean;
}

enum RateLimitFields {
    RATE_LIMIT_QUESTIONS = "rateLimitQuestions",
    RATE_LIMIT_MINUTES = "rateLimitMinutes",
    RATE_LIMIT_LENGTH = "rateLimitLength",
}

const castInt = (n: string): number | undefined => {
    let casted: number | undefined = parseInt(n, 10);
    if (isNaN(casted)) {
        casted = undefined;
    }

    return casted;
};

const QueueForm = (props: QueueFormProps) => {
    /* STATE */
    const descCharLimit: number = 1000;
    const templCharLimit: number = 1000;
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const { queue } = props;
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState<QueueFormInput>({
        name: queue.name,
        description: queue.description,
        questionTemplate: queue.questionTemplate,
        queueId: queue.id,
        videoChatSetting: queue.videoChatSetting,
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
        pin: queue.pin,
        pinEnabled: queue.pinEnabled,
    });
    const [validQuestionRate, setValidQuestionRate] = useState(true);
    const [validMinsRate, setValidMinsRate] = useState(true);
    const [validLenRate, setValidLenRate] = useState(true);

    const [nameCharCount, setNameCharCount] = useState(input.name.length);
    const [descCharCount, setDescCharCount] = useState(
        input.description.length
    );
    const [templCharCount, setTemplCharCount] = useState(
        input.questionTemplate.length
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
            input.description === queue.description &&
            input.questionTemplate === queue.questionTemplate &&
            input.videoChatSetting === queue.videoChatSetting &&
            input.pinEnabled === queue.pinEnabled;
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
        if (name === "description" && value.length > descCharLimit) return;
        if (name === "questionTemplate" && value.length > templCharLimit)
            return;
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
        setTemplCharCount(input.questionTemplate.length);
        setNameCharCount(input.name.length);
    };

    const handleVideoChatInputChange = (e, { name }) => {
        switch (name) {
            case "videoChatRequired":
                input.videoChatSetting = VideoChatSetting.REQUIRED;
                break;
            case "videoChatOptional":
                input.videoChatSetting = VideoChatSetting.OPTIONAL;
                break;
            case "videoChatDisabled":
                input.videoChatSetting = VideoChatSetting.DISABLED;
                break;
        }
        setInput({ ...input });
    };

    const handlePinInputChange = (e, { name }) => {
        input.pinEnabled = name === "pinRequired";
        setInput({ ...input });
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
                        <Form.TextArea
                            id="form-desc"
                            defaultValue={input.description}
                            name="description"
                            disabled={loading}
                            onChange={handleInputChange}
                        />
                        <div
                            style={{
                                textAlign: "right",
                                color:
                                    descCharCount < descCharLimit
                                        ? ""
                                        : "crimson",
                            }}
                        >
                            {`Characters: ${descCharCount}/${descCharLimit}`}
                        </div>
                    </Form.Field>
                    <Form.Field>
                        <label htmlFor="form-desc">Question Template</label>
                        <Form.TextArea
                            id="form-desc"
                            defaultValue={input.questionTemplate}
                            name="questionTemplate"
                            disabled={loading}
                            onChange={handleInputChange}
                        />
                        <div
                            style={{
                                textAlign: "right",
                                color:
                                    templCharCount < templCharLimit
                                        ? ""
                                        : "crimson",
                            }}
                        >
                            {`Characters: ${templCharCount}/${templCharLimit}`}
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
                                minutes per student when queue has at least
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

                    <Form.Field required>
                        <label htmlFor="video-radio">Video Chat</label>
                        <Form.Group id="video-radio">
                            <Form.Radio
                                label="Require Link"
                                checked={
                                    input.videoChatSetting ===
                                    VideoChatSetting.REQUIRED
                                }
                                name="videoChatRequired"
                                disabled={loading}
                                onChange={handleVideoChatInputChange}
                            />
                            <Form.Radio
                                label="Allow Link"
                                checked={
                                    input.videoChatSetting ===
                                    VideoChatSetting.OPTIONAL
                                }
                                name="videoChatOptional"
                                disabled={loading}
                                onChange={handleVideoChatInputChange}
                            />
                            <Form.Radio
                                label="No Link"
                                checked={
                                    input.videoChatSetting ===
                                    VideoChatSetting.DISABLED
                                }
                                name="videoChatDisabled"
                                disabled={loading}
                                onChange={handleVideoChatInputChange}
                            />
                        </Form.Group>
                    </Form.Field>

                    <Form.Field required>
                        <label htmlFor="pin-radio">PIN</label>
                        <Form.Group id="pin-radio">
                            <Form.Radio
                                label="Require Pin"
                                checked={input.pinEnabled}
                                name="pinRequired"
                                disabled={loading}
                                onChange={handlePinInputChange}
                            />
                            <Form.Radio
                                label="No Pin"
                                checked={!input.pinEnabled}
                                name="pinDisabled"
                                disabled={loading}
                                onChange={handlePinInputChange}
                            />
                        </Form.Group>
                    </Form.Field>

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
