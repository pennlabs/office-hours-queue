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
import nextRedirect from "../../../utils/redirect";
import { CoursePageProps, Course, Membership } from "../../../types";
import Analytics from "../../../components/Course/Analytics/Analytics";

const AnalyticsPage = (props: CoursePageProps) => {
    const { course, leadership } = props;
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
                        return <Analytics />;
                    }}
                />
            </Grid>
        </>
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

    const response = await doMultipleSuccessRequests([
        { path: `/courses/${query.course}/`, data },
        { path: `/courses/${query.course}/members/`, data },
    ]);

    if (response.success) {
        [course, leadership] = response.data;
    } else {
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
