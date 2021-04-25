import React from "react";
import Head from "next/head";
import { Grid } from "semantic-ui-react";
import { GetServerSidePropsContext } from "next";
import CourseWrapper from "../../../components/Course/CourseWrapper";
import staffCheck from "../../../utils/staffcheck";
import {
    withAuth,
    withAuthComponent,
    withProtectPage,
} from "../../../utils/auth";
import { doMultipleSuccessRequests } from "../../../utils/fetch";
import { isLeadershipRole } from "../../../utils/enums";
import { Course, Membership, Queue } from "../../../types";
import Analytics from "../../../components/Course/Analytics/Analytics";

interface AnalyticsPageProps {
    course: Course;
    leadership: Membership[];
    queues: Queue[];
}

const AnalyticsPage = (props: AnalyticsPageProps) => {
    const { course, leadership, queues } = props;
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
                        return <Analytics course={course} queues={queues} />;
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
    let leadership: Membership[];
    let queues: Queue[];

    const response = await doMultipleSuccessRequests([
        { path: `/api/courses/${query.course}/`, data },
        { path: `/api/courses/${query.course}/members/`, data },
        { path: `/api/courses/${query.course}/queues/`, data },
    ]);

    if (response.success) {
        [course, leadership, queues] = response.data;
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
            leadership: leadership.filter((m) => isLeadershipRole(m.kind)),
            queues,
        },
    };
}

export const getServerSideProps = withProtectPage(
    withAuth(getServerSidePropsInner),
    (user, ctx) => {
        return staffCheck(user, ctx);
    }
);

export default withAuthComponent(AnalyticsPage);
