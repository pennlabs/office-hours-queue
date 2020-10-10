import React, { MutableRefObject } from "react";
import { Grid, Segment, Icon, Message } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import Queue from "./Queue";
import { Queue as QueueType, QuestionMap } from "../../../types";

interface InstructorQueuesProps {
    courseId: number;
    queues: QueueType[];
    questionmap: QuestionMap;
    leader: boolean;
    mutate: mutateResourceListFunction<QueueType>;
    editFunc: (n: number) => void;
    createFunc: () => void;
    play: MutableRefObject<(() => void) | undefined>;
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
    } = props;

    const numActive = () => {
        return queues.reduce((count, queue) => {
            return count + (queue.archived ? 0 : 1);
        }, 0);
    };

    return (
        queues && (
            <Grid.Row columns={2}>
                {queues.length !== 0 &&
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
                )}
            </Grid.Row>
        )
    );
};

export default InstructorQueues;
