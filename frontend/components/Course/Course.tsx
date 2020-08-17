import React, { useState } from "react";
import Roster from "./Roster/Roster";
import CourseSettings from "./CourseSettings/CourseSettings";
import InstructorQueuePage from "./InstructorQueuePage/InstructorQueuePage";
import Analytics from "./Analytics/Analytics";
import CourseSidebar from "./CourseSidebar";
import Summary from "./Summary/Summary";
import { Grid, Segment, Header } from "semantic-ui-react";

// import { withAuthorization } from '../Session';
// import { compose } from 'recompose';

// import { gql } from 'apollo-boost';
// import { useQuery } from '@apollo/react-hooks';
import { leadershipSortFunc } from "../../utils";
import { useCourse } from "./CourseRequests";

/* GRAPHQL QUERIES/MUTATIONS */
// const GET_COURSE = gql`
//   query GetCourse($id: ID!) {
//     course(id: $id) {
//       id
//       department
//       courseCode
//       courseTitle
//       description
//       year
//       semester
//       inviteOnly
//       requireVideoChatUrlOnQuestions
//       videoChatEnabled
//       leadership {
//         id
//         kind
//         user {
//           id
//           fullName
//           email
//         }
//       }
//     }
//   }
// `;

// const CURRENT_USER = gql`
//   {
//     currentUser {
//       id
//     }
//   }
// `;

const Course = props => {
    /* GRAPHQL QUERIES/MUTATIONS */
    // const currentUserQuery = useQuery(CURRENT_USER);
    // const courseQuery = useQuery(GET_COURSE, { variables: {
    //   id: props.id
    // }});
    const courseQuery = {};
    const currentUserQuery = {};
    /* STATE */
    const [active, setActive] = useState("queues");
    // const [course, setCourse] = useState({});
    const [course, error, loading, mutate] = useCourse(
        props.courseId,
        props.course
    );
    //   const [memberships, error, loading, mutate]: [
    //     Membership[],
    //     any,
    //     boolean,
    //     (data: any, shouldRevalidate: boolean) => Promise<any>
    // ] = useMemberships(initalUser);
    /* LOAD DATA FUNCTIONS */

    // const loadCourse = (data) => {
    //   if (data && data.course) {
    //     return {
    //       id: data.course.id,
    //       department: data.course.department,
    //       courseCode: data.course.courseCode,
    //       courseTitle: data.course.courseTitle,
    //       description: data.course.description,
    //       year: data.course.year,
    //       semester: data.course.semester,
    //       inviteOnly: data.course.inviteOnly,
    //       requireVideoChatUrlOnQuestions: data.course.requireVideoChatUrlOnQuestions,
    //       videoChatEnabled: data.course.videoChatEnabled,
    //       leadership: data.course.leadership.sort(leadershipSortFunc),
    //     }
    //   } else {
    //     return {}
    //   }
    // };

    /* UPDATE STATE */
    // if (courseQuery && courseQuery.data) {
    //   const newCourse = loadCourse(courseQuery.data);
    //   if (JSON.stringify(newCourse) !== JSON.stringify(course)) {
    //     setCourse(newCourse);
    //   }
    // }

    /* UPDATE STATE ON QUERY */

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
                                {course.department + " " + course.courseCode}
                                <Header.Subheader>
                                    {course.courseTitle}
                                </Header.Subheader>
                            </Header>
                        </Segment>
                    </Grid.Row>
                )}
                {active === "roster" && (
                    <Roster
                        courseId={course.id}
                        memberships={props.memberships}
                        invites={props.invites}
                    />
                )}
                {active === "settings" && (
                    <CourseSettings course={course} refetch={mutate} />
                )}
                {active === "queues" && (
                        <InstructorQueuePage
                            course={course}
                            leader={props.leader}
                            userId={0}
                        />
                )
                // userId={currentUserQuery.data.currentUser.id} />
                }
                {active === "analytics" && <Analytics course={course} />}
                {active === "summary" && <Summary course={course} />}
            </Grid.Column>
        </>
    ) : (
        <></>
    );
};

// const condition = (authUser) => {
//   return authUser && authUser.hasUserObject;
// };

// export default compose(
//   withAuthorization(condition),
// )(Course);
export default Course;
