import React, { MutableRefObject } from "react";
import { Segment, Grid, Message } from "semantic-ui-react";
import StudentQueue from "./StudentQueue";
import {
    Queue,
    Course,
    mutateResourceListFunction,
    QuestionMap,
} from "../../../types";

interface StudentQueuesProps {
    queues: Queue[];
    course: Course;
    queueMutate: mutateResourceListFunction<Queue>;
    questionmap: QuestionMap;
    play: MutableRefObject<(() => void) | undefined>;
}
const StudentQueues = (props: StudentQueuesProps) => {
    const { queues, course, queueMutate, questionmap, play } = props;

    return (
        <>
            {queues && (
                <Grid.Row columns="equal">
                    {queues.length !== 0 &&
                        queues.map((queue) => (
                            <Grid.Column key={`column${queue.id}`}>
                                <StudentQueue
                                    key={queue.id}
                                    course={course}
                                    queue={queue}
                                    queueMutate={queueMutate}
                                    questions={questionmap[queue.id]}
                                    play={play}
                                />
                            </Grid.Column>
                        ))}
                    {queues.length === 0 && (
                        <Grid.Column>
                            <Segment basic>
                                <Message info>
                                    <Message.Header>No Queues</Message.Header>
                                    This course currently has no queues!
                                </Message>
                            </Segment>
                        </Grid.Column>
                    )}
                </Grid.Row>
            )}
        </>
    );
};

export default StudentQueues;
