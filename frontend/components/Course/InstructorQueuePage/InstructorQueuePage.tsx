import React, { useContext, useState } from "react";
import { Grid, Message } from "semantic-ui-react";
import { WSContext } from "@pennlabs/rest-live-hooks";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import InstructorQueues from "./InstructorQueues";
import Announcements from "../Announcements";
import QueueSettings from "./QueueSettings/QueueSettings";
import CreateQueue from "./CreateQueue/CreateQueue";
import { AuthUserContext } from "../../../utils/auth";
import { useQueues, useStaff } from "../../../hooks/data-fetching/course";
import {
    Announcement,
    Queue,
    QuestionMap,
    Tag,
    NotificationProps,
} from "../../../types";

interface InstructorQueuePageProps {
    courseId: number;
    queues: Queue[];
    questionmap: QuestionMap;
    play: NotificationProps;
    notifs: boolean;
    setNotifs: (boolean) => void;
    tags: Tag[];
    announcements: Announcement[];
}

enum PageStateEnum {
    QUEUES,
    SETTINGS,
    CREATE,
}

interface QueueState {
    kind: PageStateEnum.QUEUES;
    queueId?: number;
}

interface SettingsState {
    kind: PageStateEnum.SETTINGS;
    queueId: number;
}

interface CreateState {
    kind: PageStateEnum.CREATE;
}

type PageState = QueueState | SettingsState | CreateState;

const InstructorQueuePage = (props: InstructorQueuePageProps) => {
    const {
        courseId,
        queues: rawQueues,
        questionmap,
        play,
        notifs,
        setNotifs,
        tags,
        announcements,
    } = props;

    /* STATE */
    const { user: initialUser } = useContext(AuthUserContext);
    if (!initialUser) {
        throw new Error(
            "Invariant broken: withAuth must be used with component"
        );
    }
    const { isConnected } = useContext(WSContext);

    const { leader } = useStaff(courseId, initialUser);

    const { data: queuesData, mutate } = useQueues(courseId, rawQueues);

    // queuesData is non null because initialData is provided
    // and the key stays the same
    const queues = queuesData!;

    const [success, setSuccess] = useState(false);
    const [pageState, setPageState] = useState<PageState>({
        kind: PageStateEnum.QUEUES,
    });

    /* HANDLER FUNCTIONS */
    const onQueueSettings = (id: number) => {
        setPageState({ kind: PageStateEnum.SETTINGS, queueId: id });
    };

    const getQueue = (id: number) => {
        return queues.find((q) => q.id === id);
    };

    return (
        <>
            <Announcements
                initialAnnouncements={announcements}
                courseId={courseId}
                staff={true}
                play={play}
            />
            {!isConnected && (
                <div style={{ paddingTop: "1rem" }}>
                    <Message warning>
                        You are not currently connected to OHQ. Reconnecting...
                    </Message>
                </div>
            )}
            <Grid stackable>
                {pageState.kind === PageStateEnum.QUEUES && queues && (
                    <InstructorQueues
                        suggestedQueueId={pageState.queueId}
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
                        notifs={notifs}
                        setNotifs={setNotifs}
                        tags={tags}
                    />
                )}
                {pageState.kind === PageStateEnum.SETTINGS && (
                    <Grid.Row style={{ marginTop: "1rem" }}>
                        <QueueSettings
                            queue={getQueue(pageState.queueId)}
                            mutate={mutate}
                            backFunc={() =>
                                setPageState({
                                    kind: PageStateEnum.QUEUES,
                                    queueId: pageState.queueId,
                                })
                            }
                        />
                    </Grid.Row>
                )}
                {pageState.kind === PageStateEnum.CREATE && (
                    <Grid.Row style={{ marginTop: "1rem" }}>
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
        </>
    );
};

export default InstructorQueuePage;
