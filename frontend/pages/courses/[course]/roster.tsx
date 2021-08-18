import React from "react";
import Head from "next/head";
import { Grid } from "semantic-ui-react";
import { GetServerSidePropsContext } from "next";
import CourseWrapper from "../../../components/Course/CourseWrapper";
import {
    withAuth,
    withAuthComponent,
    withProtectPage,
} from "../../../utils/auth";
import staffCheck from "../../../utils/staffcheck";
import { doMultipleSuccessRequests } from "../../../utils/fetch";
import { isLeadershipRole } from "../../../utils/enums";
import {
    CoursePageProps,
    Membership,
    MembershipInvite,
    Course,
} from "../../../types";
import Roster from "../../../components/Course/Roster/Roster";

interface RosterPageProps extends CoursePageProps {
    memberships: Membership[];
    invites: MembershipInvite[];
}

const RosterPage = (props: RosterPageProps) => {
    const { course, leadership, memberships, invites } = props;
    return (
        <>
            <Head>
                <title>{`OHQ | ${course.department} ${course.courseCode}`}</title>
            </Head>
            <Grid columns="equal" divided style={{ width: "100%" }} stackable>
                <CourseWrapper
                    course={course}
                    leadership={leadership}
                    render={() => {
                        return (
                            <Roster
                                course={course}
                                memberships={memberships}
                                invites={invites}
                            />
                        );
                    }}
                />
            </Grid>
        </>
    );
};

async function getServerSidePropsInner(context: GetServerSidePropsContext) {
    const { query, req } = context;
    const data = {
        headers: req ? { cookie: req.headers.cookie } : undefined,
    };

    let course: Course;
    let memberships: Membership[];
    let invites: MembershipInvite[];

    const response = await doMultipleSuccessRequests([
        { path: `/api/courses/${query.course}/`, data },
        { path: `/api/courses/${query.course}/members/`, data },
        { path: `/api/courses/${query.course}/invites/`, data },
    ]);

    if (response.success) {
        [course, memberships, invites] = response.data;
    } else {
        return {
            redirect: {
                destination: "/404",
                permanent: false,
            },
        };
    }

    return {
        props: {
            course,
            memberships,
            invites,
            leadership: memberships.filter((m) => isLeadershipRole(m.kind)),
        },
    };
}

export const getServerSideProps = withProtectPage(
    withAuth(getServerSidePropsInner),
    (user, ctx) => {
        return staffCheck(user, ctx);
    }
);

export default withAuthComponent(RosterPage);
