import React from "react";
import { Grid } from "semantic-ui-react";
import { NextPageContext } from "next";
import CourseWrapper from "../../../components/Course/CourseWrapper";
import { withAuth } from "../../../context/auth";
import staffCheck from "../../../utils/staffcheck";
import { withProtectPage } from "../../../utils/protectpage";
import { doApiRequest } from "../../../utils/fetch";
import { isLeadershipRole } from "../../../utils/enums";
import nextRedirect from "../../../utils/redirect";
import { CoursePageProps, Course, Membership } from "../../../types";
import Analytics from "../../../components/Course/Analytics/Analytics";

const AnalyticsPage = (props: CoursePageProps) => {
    const { course, leadership } = props;
    return (
        <Grid columns="equal" divided style={{ width: "100%" }} stackable>
            <CourseWrapper
                course={course}
                leadership={leadership}
                render={() => {
                    return <Analytics />;
                }}
            />
        </Grid>
    );
};

AnalyticsPage.getInitialProps = async (
    context: NextPageContext
): Promise<CoursePageProps> => {
    const { query, req } = context;
    const data = {
        headers: req ? { cookie: req.headers.cookie } : undefined,
    };
    let course: Course;
    let leadership: Membership[];

    try {
        [course, leadership] = await Promise.all([
            doApiRequest(`/courses/${query.course}/`, data).then((res) =>
                res.json()
            ),
            doApiRequest(
                `/courses/${query.course}/members/`,
                data
            ).then((res) => res.json()),
        ]);
    } catch (err) {
        nextRedirect(context, () => true, "/404");
        throw new Error("Next should redirect: unreachable");
    }

    return {
        course,
        leadership: leadership.filter((m) => isLeadershipRole(m.kind)),
    };
};

export default withProtectPage(withAuth(AnalyticsPage), (user, ctx) => {
    return staffCheck(user, ctx);
});
