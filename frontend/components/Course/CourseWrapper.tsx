import React, { useState, useContext } from "react";
import { Grid, Segment, Header } from "semantic-ui-react";
import CourseSidebar from "./CourseSidebar";

import { AuthUserContext } from "../../context/auth";
import { useCourse, useStaff } from "../../hooks/data-fetching/course";
import { Course as CourseType, Membership } from "../../types";

interface CourseProps {
    render: (staff: boolean) => JSX.Element;
    course: CourseType;
    leadership: Membership[];
}
const CourseWrapper = ({ render, ...props }: CourseProps) => {
    const { course: rawCourse, leadership } = props;
    const [course, , ,] = useCourse(rawCourse.id, rawCourse);
    const { user: initialUser } = useContext(AuthUserContext);
    const [, staff, , ,] = useStaff(rawCourse.id, initialUser);

    return course ? (
        <>
            <CourseSidebar courseId={course.id} leadership={leadership} />
            <Grid.Column width={13}>
                {course.department && (
                    <Grid.Row>
                        <Segment basic>
                            <Header as="h1">
                                {`${course.department} ${course.courseCode}`}
                                <Header.Subheader>
                                    {course.courseTitle}
                                </Header.Subheader>
                            </Header>
                        </Segment>
                    </Grid.Row>
                )}
                {render(staff)}
            </Grid.Column>
        </>
    ) : (
        <></>
    );
};

export default CourseWrapper;
