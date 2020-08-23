import React from "react";
import { Grid } from "semantic-ui-react";
import StudentQueues from "./StudentQueues";

import { useQueues, useCourse } from "../../../hooks/data-fetching/course";
import { Course, Queue } from "../../../types";

interface StudentQueuePageProps {
    course: Course;
    queues: Queue[];
}
const StudentQueuePage = (props: StudentQueuePageProps) => {
    const { course: rawCourse, queues: rawQueues } = props;
    const [course, , ,] = useCourse(rawCourse.id, rawCourse);
    const [queues, , , mutate] = useQueues(course.id, rawQueues);

    return (
        <Grid stackable>
            <StudentQueues
                course={course}
                queues={queues}
                queueMutate={mutate}
            />
        </Grid>
    );
};

export default StudentQueuePage;
