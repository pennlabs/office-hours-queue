import React from "react";
import { Segment, Header, Grid } from "semantic-ui-react";
import CourseForm from "./CourseForm";
import { Course, mutateResourceFunction } from "../../../types";

interface CourseSettingsProps {
    course: Course;
    refetch: mutateResourceFunction<Course>;
}

const CourseSettings = (props: CourseSettingsProps) => {
    const { course, refetch } = props;
    return (
        <div>
            <Grid.Row>
                <Segment basic>
                    <Header as="h3">Course Settings</Header>
                </Segment>
            </Grid.Row>
            <Grid.Row>
                <Segment basic>
                    <CourseForm course={course} refetch={refetch} />
                </Segment>
            </Grid.Row>
        </div>
    );
};

export default CourseSettings;
