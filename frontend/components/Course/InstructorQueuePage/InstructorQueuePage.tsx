import React, { useContext, useState } from "react";
import { Grid } from "semantic-ui-react";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import InstructorQueues from "./InstructorQueues";
import QueueSettings from "./QueueSettings/QueueSettings";
import CreateQueue from "./CreateQueue/CreateQueue";
import { useQueues } from "../CourseRequests";
import { AuthUserContext } from "../../../context/auth";

const InstructorQueuePage = props => {
    const {
        leader,
        course: { id: courseId },
    } = props;

    /* STATE */
    const [queues, error, isValidating, mutate] = useQueues(courseId);
    const [success, setSuccess] = useState(false);
    const [activeQueueId, setActiveQueueId] = useState(null);
    const [active, setActive] = useState("queues");

    /* HANDLER FUNCTIONS */
    const onQueueSettings = id => {
        setActiveQueueId(id);
        setActive("settings");
    };

    const getQueue = id => queues.filter(q => q.id === id)[0];

    return (
        <Grid stackable>
            {active === "queues" && (
                <InstructorQueues
                    queues={queues}
                    editFunc={onQueueSettings}
                    createFunc={() => {
                        setActive("create");
                    }}
                    refetch={mutate}
                    leader={leader}
                />
            )}
            {active === "settings" && (
                <Grid.Row>
                    <QueueSettings
                        queue={getQueue(activeQueueId)}
                        refetch={mutate}
                        backFunc={() => setActive("queues")}
                    />
                </Grid.Row>
            )}
            {active === "create" && (
                <Grid.Row>
                    <CreateQueue
                        courseId={courseId}
                        refetch={mutate}
                        successFunc={() => setSuccess(true)}
                        backFunc={() => setActive("queues")}
                    />
                </Grid.Row>
            )}
            <Snackbar
                open={success}
                autoHideDuration={6000}
                onClose={() => setSuccess(false)}
            >
                <Alert severity="success" onClose={() => setSuccess(false)}>
                    <span>Queue successfully created</span>
                </Alert>
            </Snackbar>
        </Grid>
    );
};

export default InstructorQueuePage;
