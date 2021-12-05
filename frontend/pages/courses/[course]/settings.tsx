import Head from "next/head";
import { Grid } from "semantic-ui-react";
import { NextPageContext } from "next";
import CourseWrapper from "../../../components/Course/CourseWrapper";
import { withAuth } from "../../../context/auth";
import staffCheck from "../../../utils/staffcheck";
import { withProtectPage } from "../../../utils/protectpage";
import { doMultipleSuccessRequests } from "../../../utils/fetch";
import { isLeadershipRole } from "../../../utils/enums";
import CourseSettings from "../../../components/Course/CourseSettings/CourseSettings";
import {
    CoursePageProps,
    Course,
    Membership,
    Tag,
    UserMembership,
    User,
} from "../../../types";
import nextRedirect from "../../../utils/redirect";

interface SettingsPageProps extends CoursePageProps {
    tags: Tag[];
    membership: UserMembership;
}

const SettingsPage = (props: SettingsPageProps) => {
    const { course, leadership, tags, membership } = props;
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
                            <CourseSettings
                                course={course}
                                tags={tags}
                                membership={membership}
                            />
                        );
                    }}
                />
            </Grid>
        </>
    );
};

SettingsPage.getInitialProps = async (
    context: NextPageContext
): Promise<SettingsPageProps> => {
    const { query, req } = context;
    const data = {
        headers: req ? { cookie: req.headers.cookie } : undefined,
    };

    let course: Course;
    let leadership: Membership[];
    let tags: Tag[];
    let user: User;
    let membership: UserMembership;

    const response = await doMultipleSuccessRequests([
        { path: `/api/courses/${query.course}/`, data },
        { path: `/api/courses/${query.course}/members/`, data },
        { path: `/api/courses/${query.course}/tags/`, data },
        { path: "/api/accounts/me/", data },
    ]);

    if (response.success) {
        [course, leadership, tags, user] = response.data;

        membership = user.membershipSet.find(
            (item) => item.course.id === course.id
        )!;

        if (course.archived) {
            nextRedirect(
                context,
                () => true,
                `/courses/${query.course}/roster`
            );
        }
    } else {
        nextRedirect(context, () => true, "/404");
        throw new Error("Next should redirect: unreachable");
    }

    return {
        course,
        leadership: leadership.filter((m) => isLeadershipRole(m.kind)),
        tags,
        membership,
    };
};

export default withProtectPage(withAuth(SettingsPage), (user, ctx) => {
    return staffCheck(user, ctx);
});
