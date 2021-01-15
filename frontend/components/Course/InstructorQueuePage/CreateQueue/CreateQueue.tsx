import React, { useState } from "react";
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
const CreateQueue = (props: CreateQueueProps) => {
    const { courseId, backFunc, successFunc, mutate } = props;
    /* STATE */
    const [disabled, setDisabled] = useState(true);
    const [error, setError] = useState(false);
    const [input, setInput] = useState({
        name: "",
        description: "",
        tags: [],
        startEndTimes: [],
        courseId,
    });
    const [mutateLoading, setRefetchLoading] = useState(false);

    /* HANDLER FUNCTIONS */
    const handleInputChange = (e, { name, value }) => {
        input[name] = value;
        setInput(input);
        setDisabled(!input.name || !input.description);
    };

    const onSubmit = async () => {
        try {
            await createQueue(courseId, input);
            await setRefetchLoading(true);
            await mutate(-1, null);
            await setRefetchLoading(false);
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
                        <Button
                            content="Create"
                            color="blue"
                            type="submit"
                            disabled={disabled || mutateLoading}
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
