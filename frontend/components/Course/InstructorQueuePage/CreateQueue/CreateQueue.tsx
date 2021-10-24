import { useState, useMemo } from "react";
import { Grid, Segment, Header, Form, Button } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import { createQueue } from "../../../../hooks/data-fetching/course";
import { Queue, VideoChatSetting } from "../../../../types";
import { logException } from "../../../../utils/sentry";

interface CreateQueueProps {
    courseId: number;
    backFunc: () => void;
    successFunc: () => void;
    mutate: mutateResourceListFunction<Queue>;
}

interface QueueFormInput {
    name: string;
    description: string;
    questionTemplate: string;
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

const CreateQueue = (props: CreateQueueProps) => {
    const { courseId, backFunc, successFunc, mutate } = props;
    /* STATE */
    const [error, setError] = useState(false);
    const [input, setInput] = useState<QueueFormInput>({
        name: "",
        description: "",
        questionTemplate: "",
        videoChatSetting: VideoChatSetting.DISABLED,
        rateLimitEnabled: false,
        rateLimitLength: undefined,
        rateLimitQuestions: undefined,
        rateLimitMinutes: undefined,
        pin: undefined,
        pinEnabled: true,
    });

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
        return invalidInps;
    }, [input]);

    const [validQuestionRate, setValidQuestionRate] = useState(true);
    const [validMinsRate, setValidMinsRate] = useState(true);
    const [validLenRate, setValidLenRate] = useState(true);
    const [mutateLoading, setRefetchLoading] = useState(false);

    /* HANDLER FUNCTIONS */
    const handleInputChange = (e, { name, value }) => {
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
    };

    const handlePinInputChange = (e, { name }) => {
        input.pinEnabled = name === "pinRequired";
        setInput({ ...input });
    };

    const onSubmit = async () => {
        try {
            await createQueue(courseId, input);
            setRefetchLoading(true);
            await mutate(-1, null);
            setRefetchLoading(false);
            backFunc();
            successFunc();
        } catch (e) {
            logException(e);
            setError(true);
        }
    };

    return (
        <Grid.Column width={16}>
            <Grid.Row>
                <Segment basic>
                    <Header as="h3">Create New Queue</Header>
                </Segment>
            </Grid.Row>
            <Grid.Row>
                <Segment basic>
                    <Form>
                        <Form.Field required>
                            <label htmlFor="form-name">Name</label>
                            <Form.Input
                                id="form-name"
                                placeholder="Name"
                                name="name"
                                disabled={mutateLoading}
                                onChange={handleInputChange}
                            />
                        </Form.Field>
                        <Form.Field required>
                            <label htmlFor="form-desc">Description</label>
                            <Form.Input
                                id="form-desc"
                                placeholder="Description"
                                name="description"
                                disabled={mutateLoading}
                                onChange={handleInputChange}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label htmlFor="form-question-template">
                                Question Template
                            </label>
                            <Form.Input
                                id="form-question-template"
                                name="questionTemplate"
                                disabled={mutateLoading}
                                onChange={handleInputChange}
                            />
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
                                    disabled={mutateLoading}
                                    onChange={handleVideoChatInputChange}
                                />
                                <Form.Radio
                                    label="Allow Link"
                                    checked={
                                        input.videoChatSetting ===
                                        VideoChatSetting.OPTIONAL
                                    }
                                    name="videoChatOptional"
                                    disabled={mutateLoading}
                                    onChange={handleVideoChatInputChange}
                                />
                                <Form.Radio
                                    label="No Link"
                                    checked={
                                        input.videoChatSetting ===
                                        VideoChatSetting.DISABLED
                                    }
                                    name="videoChatDisabled"
                                    disabled={mutateLoading}
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
                                    disabled={mutateLoading}
                                    onChange={handlePinInputChange}
                                />
                                <Form.Radio
                                    label="No Pin"
                                    checked={!input.pinEnabled}
                                    name="pinDisabled"
                                    disabled={mutateLoading}
                                    onChange={handlePinInputChange}
                                />
                            </Form.Group>
                        </Form.Field>

                        <Button
                            content="Create"
                            color="blue"
                            type="submit"
                            disabled={isDisabled || mutateLoading}
                            onClick={onSubmit}
                        />
                        <Button
                            content="Cancel"
                            type="submit"
                            disabled={mutateLoading}
                            onClick={backFunc}
                        />
                    </Form>
                </Segment>
            </Grid.Row>
            <Snackbar
                open={error}
                autoHideDuration={6000}
                onClose={() => setError(false)}
            >
                <Alert severity="error" onClose={() => setError(false)}>
                    <span>
                        There was an error creating this queue. Names must be
                        unique.
                    </span>
                </Alert>
            </Snackbar>
        </Grid.Column>
    );
};

export default CreateQueue;
