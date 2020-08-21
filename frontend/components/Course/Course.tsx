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

const Course = (props) => {
    const [active, setActive] = useState("queues");
    const [course, error, loading, mutate] = useCourse(
        props.courseId,
        props.course
    );
    const { user: initialUser } = useContext(AuthUserContext);
    const [leader, staff, leaderError, staffLoading, staffMutate] = useStaff(
        props.courseId,
        initialUser
    );

    return course ? (
        <>
            <CourseSidebar
                courseId={course.id}
                active={active}
                clickFunc={setActive}
                leadership={props.leadership}
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
                {staff && active === "roster" && (
                    <Roster
                        courseId={course.id}
                        memberships={props.memberships}
                        invites={props.invites}
                    />
                )}
                {staff && active === "settings" && (
                    <CourseSettings course={course} refetch={mutate} />
                )}
                {staff && active === "queues" && (
                    <InstructorQueuePage courseId={course.id} />
                )}
                {staff && active === "analytics" && <Analytics />}
                {staff && active === "summary" && <Summary course={course} />}
                {!staff && <StudentQueuePage course={course} />}
            </Grid.Column>
        </>
    ) : (
        <></>
    );
};

export default Course;
