import React, { MutableRefObject } from "react";
import { Grid } from "semantic-ui-react";
import StudentQueues from "./StudentQueues";

import { useQueues, useCourse } from "../../../hooks/data-fetching/course";
import { Course, Queue, QuestionMap } from "../../../types";

interface StudentQueuePageProps {
    course: Course;
    queues: Queue[];
    questionmap: QuestionMap;
    play: MutableRefObject<(() => void) | undefined>;
}
const StudentQueuePage = (props: StudentQueuePageProps) => {
    const { course: rawCourse, queues: rawQueues, questionmap, play } = props;
    const [course, , ,] = useCourse(rawCourse.id, rawCourse);
    const [queues, , , mutate] = useQueues(course!.id, rawQueues);

    return (
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
    );
};

export default StudentQueuePage;
