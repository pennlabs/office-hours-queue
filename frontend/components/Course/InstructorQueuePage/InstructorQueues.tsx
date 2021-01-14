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
import { QueueMenuItem } from "./QueueMenuItem";

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
                <Grid.Column width={3}>
                    <Menu
                        fluid
                        vertical
                        style={{ display: "flex", minHeight: "20rem" }}
                    >
                        {dispQueues.map((q) => (
                            <QueueMenuItem
                                key={q.id}
                                queue={q}
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
                <Grid.Column stretched width={13}>
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
                                <Message.Header>Create a Queue</Message.Header>
                                Create a queue to get started!
                            </Message.Content>
                        </Message>
                    )}
                </Grid.Column>
            </Grid.Row>
        )
    );
};

export default InstructorQueues;
