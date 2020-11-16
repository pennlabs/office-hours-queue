import React from "react";
import { Segment, Header, Grid } from "semantic-ui-react";
import CourseForm from "./CourseForm";
import { Course, Tag } from "../../../types";
import { useCourse, useTags } from "../../../hooks/data-fetching/course";

interface CourseSettingsProps {
    course: Course;
    tags: Tag[];
}

const CourseSettings = (props: CourseSettingsProps) => {
    const { course: rawCourse, tags: rawTags } = props;
    const [courseData, , , mutateCourse] = useCourse(rawCourse.id, rawCourse);
    const [tagsData, , , mutateTags] = useTags(rawCourse.id, rawTags);

    // courseData is non null because initialData is provided
    // and the key stays the same
    const course = courseData!;
    const tags = tagsData!;

    return (
        <div>
            <Grid.Row>
                <Segment basic>
                    <Header as="h3">Course Settings</Header>
                </Segment>
            </Grid.Row>
            <Grid.Row>
                <Segment basic>
                    <CourseForm
                        course={course}
                        tags={tags}
                        mutateCourse={mutateCourse}
                        mutateTags={mutateTags}
                    />
                </Segment>
            </Grid.Row>
        </div>
    );
};

export default CourseSettings;
