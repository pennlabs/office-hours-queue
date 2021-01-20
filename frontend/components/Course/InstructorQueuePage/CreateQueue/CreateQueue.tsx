import React, { useState, useMemo } from "react";
import { Grid, Segment, Header, Form, Button } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import { createQueue } from "../../../../hooks/data-fetching/course";
import { Queue } from "../../../../types";
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
    rateLimitEnabled: boolean;
    rateLimitLength?: number;
    rateLimitQuestions?: number;
    rateLimitMinutes?: number;
}

const CreateQueue = (props: CreateQueueProps) => {
    const { courseId, backFunc, successFunc, mutate } = props;
    /* STATE */
    const [error, setError] = useState(false);
    const [input, setInput] = useState<QueueFormInput>({
        name: "",
        description: "",
        rateLimitEnabled: false,
        rateLimitLength: undefined,
        rateLimitQuestions: undefined,
        rateLimitMinutes: undefined,
    });

    const isDisabled = useMemo(() => {
        let invalidInps = !input.name || !input.description;
        if (input.rateLimitEnabled) {
            invalidInps =
                invalidInps ||
                !input.rateLimitLength ||
                !input.rateLimitQuestions ||
                !input.rateLimitMinutes;
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
        if (name === "rateLimitQuestions") {
            input[name] = parseInt(input[name], 10);
            setValidQuestionRate(value > 0);
        }

        if (name === "rateLimitMinutes") {
            input[name] = parseInt(input[name], 10);
            setValidMinsRate(value > 0);
        }

        if (name === "rateLimitLengt") {
            input[name] = parseInt(input[name], 10);
            setValidLenRate(value > 0);
        }
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
                                    name="rateLimitQuestions"
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
                                    name="rateLimitMinutes"
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
                                    name="rateLimitLength"
                                    defaultValue={input.rateLimitLength}
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
