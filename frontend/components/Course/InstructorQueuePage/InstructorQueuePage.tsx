import React, { useContext, useState } from "react";
import { Grid } from "semantic-ui-react";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import InstructorQueues from "./InstructorQueues";
import QueueSettings from "./QueueSettings/QueueSettings";
import CreateQueue from "./CreateQueue/CreateQueue";
import { AuthUserContext } from "../../../context/auth";
import { useQueues, useStaff } from "../../../hooks/data-fetching/course";
import { Queue, QuestionMap } from "../../../types";

interface InstructorQueuePageProps {
    courseId: number;
    queues: Queue[];
    questionmap: QuestionMap;
    play: () => void;
}

enum PageStateEnum {
    QUEUES,
    SETTINGS,
    CREATE,
}

interface QueueState {
    kind: PageStateEnum.QUEUES;
}

interface SettingsState {
    kind: PageStateEnum.SETTINGS;
    queueID: number;
}

interface CreateState {
    kind: PageStateEnum.CREATE;
}

type PageState = QueueState | SettingsState | CreateState;

const InstructorQueuePage = (props: InstructorQueuePageProps) => {
    const { courseId, queues: rawQueues, questionmap, play } = props;

    /* STATE */
    const { user: initialUser } = useContext(AuthUserContext);
    if (!initialUser) {
        throw new Error(
            "Invariant broken: withAuth must be used with component"
        );
    }

    const [leader, , , ,] = useStaff(courseId, initialUser);

    const [queuesData, , , mutate] = useQueues(courseId, rawQueues);

    // queuesData is non null because initialData is provided
    // and the key stays the same
    const queues = queuesData!;

    const [success, setSuccess] = useState(false);
    const [pageState, setPageState] = useState<PageState>({
        kind: PageStateEnum.QUEUES,
    });

    /* HANDLER FUNCTIONS */
    const onQueueSettings = (id: number) => {
        setPageState({ kind: PageStateEnum.SETTINGS, queueID: id });
    };

    const getQueue = (id: number) => {
        return queues.find((q) => q.id === id);
    };

    return (
        <Grid stackable>
            {pageState.kind === PageStateEnum.QUEUES && queues && (
                <InstructorQueues
                    courseId={courseId}
                    queues={queues}
                    questionmap={questionmap}
                    editFunc={onQueueSettings}
                    createFunc={() => {
                        setPageState({ kind: PageStateEnum.CREATE });
                    }}
                    mutate={mutate}
                    leader={leader}
                    play={play}
                />
            )}
            {pageState.kind === PageStateEnum.SETTINGS && (
                <Grid.Row>
                    <QueueSettings
                        queue={getQueue(pageState.queueID)}
                        mutate={mutate}
                        backFunc={() =>
                            setPageState({ kind: PageStateEnum.QUEUES })
                        }
                    />
                </Grid.Row>
            )}
            {pageState.kind === PageStateEnum.CREATE && (
                <Grid.Row>
                    <CreateQueue
                        courseId={courseId}
                        mutate={mutate}
                        successFunc={() => setSuccess(true)}
                        backFunc={() =>
                            setPageState({ kind: PageStateEnum.QUEUES })
                        }
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
