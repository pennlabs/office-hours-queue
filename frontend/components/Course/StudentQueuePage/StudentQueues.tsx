import React, { MutableRefObject, useState, useMemo } from "react";
import { Grid, Message, Menu } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import StudentQueue from "./StudentQueue";
import { Queue, Course, QuestionMap, Tag } from "../../../types";
import { QueueMenuItem } from "./QueueMenuItem";

interface StudentQueuesProps {
    queues: Queue[];
    course: Course;
    queueMutate: mutateResourceListFunction<Queue>;
    questionmap: QuestionMap;
    play: MutableRefObject<() => void>;
    tags: Tag[];
}
const StudentQueues = (props: StudentQueuesProps) => {
    const { queues, course, queueMutate, questionmap, play, tags } = props;

    const dispQueues = queues.filter((q) => !q.archived);
    const [selQueue, setSelQueue] = useState<number | undefined>(
        dispQueues.find((q) => !q.archived)?.id
    );
    const currQueue = useMemo(() => {
        return dispQueues.find((q) => q.id === selQueue);
    }, [selQueue, dispQueues]);

    return (
        <>
            {queues && (
                <Grid.Row style={{ marginTop: "2rem" }} columns={2}>
                    {currQueue && (
                        <>
                            <Grid.Column width={3}>
                                <Menu
                                    fluid
                                    vertical
                                    style={{
                                        display: "flex",
                                        minHeight: "20rem",
                                    }}
                                >
                                    {dispQueues.map((q) => (
                                        <QueueMenuItem
                                            key={q.id}
                                            queue={q}
                                            courseId={course.id}
                                            initialQuestions={questionmap[q.id]}
                                            active={selQueue === q.id}
                                            setActiveQueue={setSelQueue}
                                        />
                                    ))}
                                </Menu>
                            </Grid.Column>
                            <Grid.Column stretched width={13}>
                                <StudentQueue
                                    key={currQueue.id}
                                    course={course}
                                    queue={currQueue}
                                    tags={tags}
                                    queueMutate={queueMutate}
                                    questions={questionmap[currQueue.id] || []}
                                    play={play}
                                />
                            </Grid.Column>
                        </>
                    )}
                    {!currQueue && (
                        <Grid.Column width={16}>
                            <Message info>
                                <Message.Header>No Queues</Message.Header>
                                This course currently has no queues!
                            </Message>
                        </Grid.Column>
                    )}
                </Grid.Row>
            )}
        </>
    );
};

export default StudentQueues;
