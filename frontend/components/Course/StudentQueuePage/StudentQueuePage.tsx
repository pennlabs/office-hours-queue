import React, { useContext } from "react";
import { Grid, Message } from "semantic-ui-react";
import { WSContext } from "@pennlabs/rest-live-hooks";
import StudentQueues from "./StudentQueues";

import { useQueues, useCourse } from "../../../hooks/data-fetching/course";
import { Course, Queue, QuestionMap } from "../../../types";

interface StudentQueuePageProps {
    course: Course;
    queues: Queue[];
    questionmap: QuestionMap;
}
const StudentQueuePage = (props: StudentQueuePageProps) => {
    const { course: rawCourse, queues: rawQueues, questionmap } = props;
    const [course, , ,] = useCourse(rawCourse.id, rawCourse);
    const { data: queues, mutate } = useQueues(course!.id, rawQueues);

    const { isConnected } = useContext(WSContext);

    return (
        <>
            {!isConnected && (
                <Message warning>
                    You are not currently connected to OHQ. Reconnecting...
                </Message>
            )}
            <Grid stackable>
                <StudentQueues
                    // course and queues are non-null because
                    // key never changes and initial data are provided
                    course={course!}
                    queues={queues!}
                    queueMutate={mutate}
                    questionmap={questionmap}
                />
            </Grid>
        </>
    );
};

export default StudentQueuePage;
