import React from "react";
import { Segment, Header, Grid } from "semantic-ui-react";
import CourseForm from "./CourseForm";
import { Course } from "../../../types";
import { useCourse } from "../../../hooks/data-fetching/course";

interface CourseSettingsProps {
    course: Course;
}

const CourseSettings = (props: CourseSettingsProps) => {
    const { course: rawCourse } = props;
    const { data: courseData, mutate } = useCourse(rawCourse.id, rawCourse);

    // courseData is non null because initialData is provided
    // and the key stays the same
    const course = courseData!;

    return (
        <div>
            <Grid.Row>
                <Segment basic>
                    <Header as="h3">Course Settings</Header>
                </Segment>
            </Grid.Row>
            <Grid.Row>
                <Segment basic>
                    <CourseForm course={course} mutate={mutate} />
                </Segment>
            </Grid.Row>
        </div>
    );
};

export default CourseSettings;
