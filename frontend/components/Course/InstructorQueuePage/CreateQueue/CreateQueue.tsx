import React, { useState } from "react";
import { Grid, Segment, Header, Form, Button } from "semantic-ui-react";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import { createQueue } from "../../../../hooks/data-fetching/course";
import { mutateResourceListFunction, Queue } from "../../../../types";

interface CreateQueueProps {
    courseId: number;
    backFunc: () => void;
    successFunc: () => void;
    mutate: mutateResourceListFunction<Queue>;
}
const CreateQueue = (props: CreateQueueProps) => {
    /* STATE */
    const [disabled, setDisabled] = useState(true);
    const [error, setError] = useState(false);
    const [input, setInput] = useState({
        name: null,
        description: null,
        tags: [],
        startEndTimes: [],
        courseId: props.courseId,
    });
    const [refetchLoading, setRefetchLoading] = useState(false);

    /* HANDLER FUNCTIONS */
    const handleInputChange = (e, { name, value }) => {
        input[name] = value;
        setInput(input);
        setDisabled(!input.name || !input.description);
    };

    const onSubmit = async () => {
        try {
            await createQueue(props.courseId, input);
            await setRefetchLoading(true);
            await props.mutate(-1, null);
            await setRefetchLoading(false);
            props.backFunc();
            props.successFunc();
        } catch (e) {
            setError(true);
        }
    };

    return (
        <Grid.Column width={13}>
            <Grid.Row>
                <Segment basic>
                    <Header as="h3">Create New Queue</Header>
                </Segment>
            </Grid.Row>
            <Grid.Row>
                <Segment basic>
                    <Form>
                        <Form.Field required>
                            <label>Name</label>
                            <Form.Input
                                placeholder="Name"
                                name="name"
                                disabled={refetchLoading}
                                onChange={handleInputChange}
                            />
                        </Form.Field>
                        <Form.Field required>
                            <label>Description</label>
                            <Form.Input
                                placeholder="Description"
                                name="description"
                                disabled={refetchLoading}
                                onChange={handleInputChange}
                            />
                        </Form.Field>
                        {/* <Form.Field>
                            <label>Tags</label>
                            <CreatableSelect
                                components={{ DropdownIndicator: null }}
                                inputValue={tagsInputValue}
                                isClearable
                                isMulti
                                menuIsOpen={false}
                                onChange={handleTagChange}
                                onInputChange={handleTagsInputChange}
                                onKeyDown={handleTagsKeyDown}
                                placeholder="Type a tag and press enter..."
                                value={tags}
                            />
                        </Form.Field> */}
                        <Button
                            content="Create"
                            color="blue"
                            type="submit"
                            disabled={disabled || refetchLoading}
                            onClick={onSubmit}
                        />
                        <Button
                            content="Cancel"
                            type="submit"
                            disabled={refetchLoading}
                            onClick={props.backFunc}
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
