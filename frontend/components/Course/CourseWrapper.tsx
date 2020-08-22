import React, { useState, useContext } from "react";
import { Grid, Segment, Header } from "semantic-ui-react";
import Roster from "./Roster/Roster";
import CourseSettings from "./CourseSettings/CourseSettings";
import InstructorQueuePage from "./InstructorQueuePage/InstructorQueuePage";
import Analytics from "./Analytics/Analytics";
import CourseSidebar from "./CourseSidebar";
import Summary from "./Summary/Summary";

import { AuthUserContext } from "../../context/auth";
import StudentQueuePage from "./StudentQueuePage/StudentQueuePage";
import { useCourse, useStaff } from "../../hooks/data-fetching/course";
import {
    Course as CourseType,
    Membership,
    MembershipInvite,
} from "../../types";

interface CourseProps {
    render: (props: any) => JSX.Element;
    courseId: number;
    course: CourseType;
    leadership: Membership[];
    memberships: Membership[];
    invites: MembershipInvite[];
}
const Course = ({ render, ...props }: CourseProps) => {
    const {
        courseId,
        course: rawCourse,
        leadership,
        memberships,
        invites,
    } = props;
    const [active, setActive] = useState("queues");
    const [course, , , mutate] = useCourse(courseId, rawCourse);
    const { user: initialUser } = useContext(AuthUserContext);
    const [, staff, , ,] = useStaff(courseId, initialUser);

    return course ? (
        <>
            <CourseSidebar
                courseId={course.id}
                active={active}
                clickFunc={setActive}
                leadership={leadership}
            />
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
                {render({
                    courseId,
                    memberships,
                    invites,
                    course,
                    staff,
                    mutate,
                })}
            </Grid.Column>
        </>
    ) : (
        <></>
    );
};

export default Course;
