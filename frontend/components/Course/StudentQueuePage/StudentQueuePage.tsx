import React from "react";
import { Grid } from "semantic-ui-react";
import StudentQueues from "./StudentQueues";

import { useQueues } from "../../../hooks/data-fetching/course";
import { Course } from "../../../types";

interface StudentQueuePageProps {
    course: Course;
}
const StudentQueuePage = (props: StudentQueuePageProps) => {
    const { course } = props;
    const [queues, , ,] = useQueues(course.id);

    return (
        <Grid stackable>
            <StudentQueues course={course} queues={queues} />
        </Grid>
    );
};

export default StudentQueuePage;
