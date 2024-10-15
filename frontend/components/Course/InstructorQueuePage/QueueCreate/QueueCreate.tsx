import { useState } from "react";
import { Grid, Segment, Header, Form, Button } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import { createQueue } from "../../../../hooks/data-fetching/course";
import { Queue, VideoChatSetting } from "../../../../types";
import QueueFormFields, { QueueFormInput } from "../QueueFormFields";

interface QueueCreateProps {
    courseId: number;
    backFunc: () => void;
    successFunc: () => void;
    mutate: mutateResourceListFunction<Queue>;
}

const QueueCreate = (props: QueueCreateProps) => {
    const { courseId, backFunc, successFunc, mutate } = props;
    /* STATE */
    const [error, setError] = useState(false);
    const [isDisabled, setDisabled] = useState(true);
    const [input, setInput] = useState<QueueFormInput>({
        name: "",
        description: "",
        questionTemplate: "",
        videoChatSetting: VideoChatSetting.DISABLED,
        pinEnabled: false,
        rateLimitEnabled: false,
        rateLimitLength: undefined,
        rateLimitQuestions: undefined,
        rateLimitMinutes: undefined,
        questionTimerEnabled: false,
        questionTimerStartTime: undefined,
    });

    const [mutateLoading, setRefetchLoading] = useState(false);

    const onSubmit = async () => {
        try {
            await createQueue(courseId, input);
            setRefetchLoading(true);
            await mutate(-1, null);
            setRefetchLoading(false);
            backFunc();
            successFunc();
        } catch (e) {
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
                        <QueueFormFields
                            defaultValues={input}
                            loading={mutateLoading}
                            setInput={setInput}
                            setDisabled={setDisabled}
                        />
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

export default QueueCreate;
