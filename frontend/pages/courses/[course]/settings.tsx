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
import CourseSettings from "../../../components/Course/CourseSettings/CourseSettings";
import { CoursePageProps, Course, Membership, Tag } from "../../../types";
import nextRedirect from "../../../utils/redirect";

interface SettingsPageProps extends CoursePageProps {
    tags: Tag[];
}

const SettingsPage = (props: SettingsPageProps) => {
    const { course, leadership, tags } = props;
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
                        return <CourseSettings course={course} tags={tags} />;
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
    let tags: Tag[];

    const response = await doMultipleSuccessRequests([
        { path: `/api/courses/${query.course}/`, data },
        { path: `/api/courses/${query.course}/members/`, data },
        { path: `/api/courses/${query.course}/tags/`, data },
    ]);

    if (response.success) {
        [course, leadership, tags] = response.data;

        if (course.archived) {
            nextRedirect(
                context,
                () => true,
                `/courses/${query.course}/roster`
            );
        }
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
            tags,
        },
    };
}

export const getServerSideProps = withProtectPage(
    withAuth(getServerSidePropsInner),
    (user, ctx) => {
        return staffCheck(user, ctx);
    }
);

export default withAuthComponent(SettingsPage);
