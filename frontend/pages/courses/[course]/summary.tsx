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
import { CoursePageProps, Course, Membership } from "../../../types";
import Summary from "../../../components/Course/Summary/Summary";
import { QuestionListResult } from "../../../hooks/data-fetching/questionsummary";

interface SummaryPageProps extends CoursePageProps {
    questionListResult: QuestionListResult;
}
const SummaryPage = (props: SummaryPageProps) => {
    const { course, leadership, questionListResult } = props;
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
                            <Summary
                                course={course}
                                questionListResult={questionListResult}
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
    let leadership: Membership[];
    let questionListResult: QuestionListResult;

    const response = await doMultipleSuccessRequests([
        { path: `/api/courses/${query.course}/`, data },
        { path: `/api/courses/${query.course}/members/`, data },
        {
            path: `/api/courses/${query.course}/questions/?order_by=-time_asked`,
            data,
        },
    ]);

    if (response.success) {
        [course, leadership, questionListResult] = response.data;
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
            questionListResult,
        },
    };
}

export const getServerSideProps = withProtectPage(
    withAuth(getServerSidePropsInner),
    (user, ctx) => {
        return staffCheck(user, ctx);
    }
);

export default withAuthComponent(SummaryPage);
