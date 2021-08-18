import { MutableRefObject, useState, useMemo, useEffect } from "react";
import { Grid, Icon, Message, Menu, Button } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import Queue from "./Queue";
import {
    Queue as QueueType,
    QuestionMap,
    Tag,
    NotificationProps,
} from "../../../types";
import { QueueMenuItem } from "./QueueMenuItem";

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
                        <Menu
                            fluid
                            vertical
                            style={{ display: "flex", minHeight: "20rem" }}
                        >
                            {dispQueues.map((q) => (
                                <QueueMenuItem
                                    key={q.id}
                                    queue={q}
                                    play={play}
                                    courseId={courseId}
                                    initialQuestions={questionmap[q.id]}
                                    active={selQueue === q.id}
                                    setActiveQueue={setSelQueue}
                                />
                            ))}

                            {leader && (
                                <Menu.Item
                                    style={{
                                        textAlign: "center",
                                        marginTop: "auto",
                                    }}
                                >
                                    <Button
                                        size="tiny"
                                        primary
                                        onClick={createFunc}
                                    >
                                        Add Queue
                                    </Button>
                                </Menu.Item>
                            )}
                        </Menu>
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
