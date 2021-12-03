import { useState, useMemo, useEffect } from "react";
import { Grid, Message } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import StudentQueue from "./StudentQueue";
import {
    Queue,
    Course,
    QuestionMap,
    Tag,
    NotificationProps,
} from "../../../types";
import { QueueList, User } from "../QueuePage/QueueList";

interface StudentQueuesProps {
    queues: Queue[];
    course: Course;
    queueMutate: mutateResourceListFunction<Queue>;
    questionmap: QuestionMap;
    play: NotificationProps;
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

    useEffect(() => {
        const q = dispQueues.find((currQ) => !currQ.archived);
        if (q && !currQueue) {
            setSelQueue(q.id);
        }
    }, [dispQueues, currQueue]);

    return (
        <>
            {queues && (
                <Grid.Row style={{ marginTop: "2rem" }} columns={2}>
                    {currQueue && (
                        <>
                            <Grid.Column width={4}>
                                <QueueList
                                    dispQueues={dispQueues}
                                    courseId={course.id}
                                    play={play}
                                    questionmap={questionmap}
                                    selQueue={selQueue}
                                    setSelQueue={setSelQueue}
                                    user={User.Student}
                                />
                            </Grid.Column>
                            <Grid.Column stretched width={12}>
                                <StudentQueue
                                    key={currQueue.id}
                                    course={course}
                                    queue={currQueue}
                                    tags={tags}
                                    queueMutate={queueMutate}
                                    questions={questionmap[currQueue.id] || []}
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
