import React, { MutableRefObject, useState, useMemo } from "react";
import {
    Grid,
    Segment,
    Icon,
    Message,
    Label,
    Menu,
    Button,
} from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import Queue from "./Queue";
import { Queue as QueueType, QuestionMap, Tag } from "../../../types";

interface InstructorQueuesProps {
    courseId: number;
    queues: QueueType[];
    questionmap: QuestionMap;
    leader: boolean;
    mutate: mutateResourceListFunction<QueueType>;
    editFunc: (n: number) => void;
    createFunc: () => void;
    play: MutableRefObject<() => void>;
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
        tags,
    } = props;

    const numActive = () => {
        return queues.reduce((count, queue) => {
            return count + (queue.archived ? 0 : 1);
        }, 0);
    };

    const dispQueues = queues.filter((q) => !q.archived);
    const [selQueue, setSelQueue] = useState<number | undefined>(
        dispQueues.find((q) => !q.archived)?.id
    );
    const currQueue = useMemo(() => {
        return dispQueues.find((q) => q.id === selQueue);
    }, [selQueue, dispQueues]);

    return (
        queues && (
            <Grid.Row style={{ marginTop: "2rem" }} columns={2}>
                <Grid.Column width={4}>
                    <Menu fluid vertical>
                        {dispQueues.map((q) => (
                            <Menu.Item
                                key={q.id}
                                style={{ worBreak: "break-word" }}
                                active={selQueue === q.id}
                                onClick={() => setSelQueue(q.id)}
                            >
                                <Label color="teal">TODO</Label>
                                {q.name}
                            </Menu.Item>
                        ))}

                        <Menu.Item>
                            <Button primary onClick={createFunc}>
                                Add Queue
                            </Button>
                        </Menu.Item>
                    </Menu>
                </Grid.Column>
                <Grid.Column stretched width={12}>
                    <Grid.Column>
                        {currQueue && (
                            <Queue
                                courseId={courseId}
                                key={currQueue.id}
                                queue={currQueue}
                                questions={questionmap[currQueue.id] || []}
                                leader={leader}
                                mutate={mutate}
                                editFunc={() => editFunc(currQueue.id)}
                                play={play}
                                tags={tags}
                            />
                        )}

                        {!currQueue && (
                            <Message info icon>
                                <Icon name="lightbulb outline" />
                                <Message.Content>
                                    <Message.Header>
                                        Create a Queue
                                    </Message.Header>
                                    Create a queue to get started!
                                </Message.Content>
                            </Message>
                        )}
                    </Grid.Column>
                </Grid.Column>
                {/* {queues.length !== 0 &&
                    queues.map(
                    (queue) =>
                    !queue.archived && (
                    <Grid.Column key={`column${queue.id}`}>
                    <Queue
                    courseId={courseId}
                    key={queue.id}
                    queue={queue}
                    questions={questionmap[queue.id]}
                    leader={leader}
                    mutate={mutate}
                    editFunc={() => editFunc(queue.id)}
                    play={play}
                    tags={tags}
                    />
                    </Grid.Column>
                    )
                    )}
                    {queues && numActive() < 2 && leader && (
                    <Grid.Column>
                    <Segment basic>
                    <Message info icon>
                    <Icon name="lightbulb outline" />
                    <Message.Content>
                    <Message.Header>
                    Create a Queue
                    </Message.Header>
                    <a
                    role="button"
                    onClick={createFunc}
                    style={{ cursor: "pointer" }}
                    >
                    Create
                    </a>{" "}
                    {queues.length === 0
                    ? "a queue to get started!"
                    : "a second queue to augment your OHQ experience!"}
                    </Message.Content>
                    </Message>
                    </Segment>
                    </Grid.Column>
                    )}
                    {queues && numActive() === 0 && !leader && (
                    <Segment basic>
                    <Message info icon>
                    <Icon name="lightbulb outline" />
                    <Message.Content>
                    <Message.Header>No Queues</Message.Header>
                    This course currently has no queues! Ask the
                    course&apos;s Head TA or Professor to create
                    one.
                    </Message.Content>
                    </Message>
                    </Segment>
                    )} */}
            </Grid.Row>
        )
    );
};

export default InstructorQueues;
