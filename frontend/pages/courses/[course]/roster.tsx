import React from "react";
import Head from "next/head";
import { Grid } from "semantic-ui-react";
import { NextPageContext } from "next";
import CourseWrapper from "../../../components/Course/CourseWrapper";
import { withAuth } from "../../../context/auth";
import staffCheck from "../../../utils/staffcheck";
import { withProtectPage } from "../../../utils/protectpage";
import { doMultipleSuccessRequests } from "../../../utils/fetch";
import { isLeadershipRole } from "../../../utils/enums";
import {
    CoursePageProps,
    Membership,
    MembershipInvite,
    Course,
} from "../../../types";
import Roster from "../../../components/Course/Roster/Roster";
import nextRedirect from "../../../utils/redirect";

interface RosterPageProps extends CoursePageProps {
    memberships: Membership[];
    invites: MembershipInvite[];
}

const RosterPage = (props: RosterPageProps) => {
    const { course, leadership, memberships, invites } = props;
    return (
        <>
            <Head>
                <title>{`OHQ | ${course.courseCode}`}</title>
            </Head>
            <Grid columns="equal" divided style={{ width: "100%" }} stackable>
                <CourseWrapper
                    course={course}
                    leadership={leadership}
                    render={() => {
                        return (
                            <Roster
                                courseId={course.id}
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

RosterPage.getInitialProps = async (
    context: NextPageContext
): Promise<RosterPageProps> => {
    const { query, req } = context;
    const data = {
        headers: req ? { cookie: req.headers.cookie } : undefined,
    };

    let course: Course;
    let memberships: Membership[];
    let invites: MembershipInvite[];

    const response = await doMultipleSuccessRequests([
        { path: `/courses/${query.course}/`, data },
        { path: `/courses/${query.course}/members/`, data },
        { path: `/courses/${query.course}/invites/`, data },
    ]);

    if (response.success) {
        [course, memberships, invites] = response.data;
    } else {
        nextRedirect(context, () => true, "/404");
        throw new Error("Next should redirect: unreachable");
    }

    return {
        course,
        memberships,
        invites,
        leadership: memberships.filter((m) => isLeadershipRole(m.kind)),
    };
};
export default withProtectPage(withAuth(RosterPage), (user, ctx) => {
    return staffCheck(user, ctx);
});
