import { useState, useMemo, useEffect } from "react";
import { Grid, Icon, Message } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import Queue from "./Queue";
import {
    Queue as QueueType,
    QuestionMap,
    Tag,
    NotificationProps,
} from "../../../types";
import { QueueList, User } from "../QueuePage/QueueList";

interface InstructorQueuesProps {
    suggestedQueueId?: number;
    courseId: number;
    queues: QueueType[];
    questionmap: QuestionMap;
    leader: boolean;
    mutate: mutateResourceListFunction<QueueType>;
    editFunc: (n: number) => void;
    createFunc: () => void;
    play: NotificationProps;
    notifs: boolean;
    setNotifs: (boolean) => void;
    tags: Tag[];
}
const InstructorQueues = (props: InstructorQueuesProps) => {
    const {
        courseId,
        queues,
        questionmap,
        leader,
        createFunc,
        mutate,
        editFunc,
        play,
        notifs,
        setNotifs,
        tags,
        suggestedQueueId,
    } = props;

    const dispQueues = useMemo(() => {
        return queues.filter((q) => !q.archived);
    }, [queues]);

    const [selQueue, setSelQueue] = useState<number | undefined>(
        suggestedQueueId &&
            dispQueues.map((q) => q.id).includes(suggestedQueueId)
            ? suggestedQueueId
            : dispQueues[0]?.id
    );

    const currQueue = useMemo(() => {
        return dispQueues.find((q) => q.id === selQueue);
    }, [selQueue, dispQueues]);

    useEffect(() => {
        const q = dispQueues.find((currQ) => !currQ.archived);
        if (q && !currQueue) {
            setSelQueue(q.id);
        }
    }, [dispQueues, currQueue]);

    return (
        <Grid.Row style={{ marginTop: "2rem" }}>
            {currQueue && (
                <>
                    <Grid.Column width={4}>
                        <QueueList
                            dispQueues={dispQueues}
                            courseId={courseId}
                            play={play}
                            questionmap={questionmap}
                            selQueue={selQueue}
                            setSelQueue={setSelQueue}
                            user={User.Student}
                            leader={leader}
                            createFunc={createFunc}
                        />
                    </Grid.Column>
                    <Grid.Column stretched width={12}>
                        <Queue
                            courseId={courseId}
                            key={currQueue.id}
                            queue={currQueue}
                            questions={questionmap[currQueue.id] || []}
                            leader={leader}
                            mutate={mutate}
                            editFunc={() => editFunc(currQueue.id)}
                            notifs={notifs}
                            setNotifs={setNotifs}
                            tags={tags}
                        />
                    </Grid.Column>
                </>
            )}
            {!currQueue && leader && (
                <Grid.Column width={16}>
                    <Message info icon>
                        <Icon name="lightbulb outline" />
                        <Message.Content>
                            <Message.Header>Create a Queue</Message.Header>
                            <a
                                role="button"
                                onClick={createFunc}
                                style={{ cursor: "pointer" }}
                            >
                                Create
                            </a>{" "}
                            a queue to get started!
                        </Message.Content>
                    </Message>
                </Grid.Column>
            )}
            {!currQueue && !leader && (
                <Grid.Column width={16}>
                    <Message info icon>
                        <Icon name="lightbulb outline" />
                        <Message.Content>
                            <Message.Header>No Queues</Message.Header>
                            This course currently has no queues! Ask the
                            course&apos;s Head TA or Professor to create one.
                        </Message.Content>
                    </Message>
                </Grid.Column>
            )}
        </Grid.Row>
    );
};

export default InstructorQueues;
