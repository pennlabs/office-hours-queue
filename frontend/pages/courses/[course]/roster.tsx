import React from "react";
import { Grid } from "semantic-ui-react";
import { NextPageContext } from "next";
import CourseWrapper from "../../../components/Course/CourseWrapper";
import { withAuth } from "../../../context/auth";
import staffCheck from "../../../utils/staffcheck";
import { withProtectPage } from "../../../utils/protectpage";
import { doApiRequest } from "../../../utils/fetch";
import { isLeadershipRole } from "../../../utils/enums";
import { CoursePageProps, Membership, MembershipInvite } from "../../../types";
import Roster from "../../../components/Course/Roster/Roster";

interface RosterPageProps extends CoursePageProps {
    memberships: Membership[];
    invites: MembershipInvite[];
}

const RosterPage = (props: RosterPageProps) => {
    const { course, leadership, memberships, invites } = props;
    return (
        <Grid columns="equal" divided style={{ width: "100%" }} stackable>
            <CourseWrapper
                course={course}
                leadership={leadership}
                render={(staff: boolean) => {
                    return (
                        staff && (
                            <Roster
                                courseId={course.id}
                                memberships={memberships}
                                invites={invites}
                            />
                        )
                    );
                }}
            />
        </Grid>
    );
};

RosterPage.getInitialProps = async (
    context: NextPageContext
): Promise<RosterPageProps> => {
    const { query, req } = context;
    const data = {
        headers: req ? { cookie: req.headers.cookie } : undefined,
    };
    const [course, memberships, invites, leadership] = await Promise.all([
        doApiRequest(`/courses/${query.course}/`, data).then((res) =>
            res.json()
        ),
        doApiRequest(`/courses/${query.course}/members/`, data).then((res) =>
            res.json()
        ),
        doApiRequest(`/courses/${query.course}/invites/`, data).then((res) =>
            res.json()
        ),
        doApiRequest(`/courses/${query.course}/members/`, data).then((res) =>
            res.json()
        ),
    ]);
    return {
        course,
        memberships,
        invites,
        leadership: leadership.filter((m) => isLeadershipRole(m.kind)),
    };
};
export default withProtectPage(withAuth(RosterPage), (user, ctx) => {
    return staffCheck(user, ctx);
});
