import React, { useContext, MutableRefObject } from "react";
import { Grid, Message } from "semantic-ui-react";
import { WSContext } from "@pennlabs/rest-live-hooks";
import StudentQueues from "./StudentQueues";

import { useQueues, useCourse } from "../../../hooks/data-fetching/course";
import { Course, Queue, QuestionMap } from "../../../types";

interface StudentQueuePageProps {
    course: Course;
    queues: Queue[];
    questionmap: QuestionMap;
    play: MutableRefObject<() => void>;
}
const StudentQueuePage = (props: StudentQueuePageProps) => {
    const { course: rawCourse, queues: rawQueues, questionmap, play } = props;
    const [course, , ,] = useCourse(rawCourse.id, rawCourse);
    const { data: queues, mutate } = useQueues(course!.id, rawQueues);

    const { isConnected } = useContext(WSContext);

    return (
        <>
            {!isConnected && (
                <div style={{paddingTop: "1rem"}}>
                    <Message warning>
                        You are not currently connected to OHQ. Reconnecting...
                    </Message>
                </div>
            )}
            <Grid stackable>
                <StudentQueues
                    // course and queues are non-null because
                    // key never changes and initial data are provided
                    course={course!}
                    queues={queues!}
                    queueMutate={mutate}
                    questionmap={questionmap}
                    play={play}
                />
            </Grid>
        </>
    );
};

export default StudentQueuePage;
