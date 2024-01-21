import Head from "next/head";
import { Grid } from "semantic-ui-react";
import { NextPageContext } from "next";
import CourseWrapper from "../../../components/Course/CourseWrapper";
import { withAuth } from "../../../context/auth";
import staffCheck from "../../../utils/staffcheck";
import { withProtectPage } from "../../../utils/protectpage";
import { CoursePageProps, Course, Membership } from "../../../types";
import { doMultipleSuccessRequests } from "../../../utils/fetch";
import { isLeadershipRole } from "../../../utils/enums";
import Reviews from "../../../components/Course/Reviews/Reviews";
import nextRedirect from "../../../utils/redirect";
// import { ReviewListResult } from '../../../hooks/data-fetching/tareviews';

interface ReviewsPageProps extends CoursePageProps {
    // reviewListResult: ReviewListResult;
}

const ReviewsPage = (props: ReviewsPageProps) => {
    const { course, leadership /* reviewListResult */ } = props;
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
                            <Reviews
                                course={course}
                                leadership={leadership}
                                // reviewListResult={reviewListResult}
                            />
                        );
                    }}
                />
            </Grid>
        </>
    );
};

ReviewsPage.getInitialProps = async (
    context: NextPageContext
): Promise<ReviewsPageProps> => {
    const { query, req } = context;
    const data = {
        headers: req ? { cookie: req.headers.cookie } : undefined,
    };

    let course: Course;
    let leadership: Membership[];
    // let reviewListResult: ReviewListResult;

    const response = await doMultipleSuccessRequests([
        { path: `/api/courses/${query.course}/`, data },
        { path: `/api/courses/${query.course}/members/`, data },
        {
            path: `/api/courses/${query.course}/questions/?order_by=-time_asked`, // this should change
            data,
        },
    ]);

    if (response.success) {
        [course, leadership /* , reviewListResult */] = response.data;
    } else {
        nextRedirect(context, () => true, "/404");
        throw new Error("Next should redirect: unreachable");
    }

    return {
        course,
        leadership: leadership.filter((m) => isLeadershipRole(m.kind)),
        // reviewListResult,
    };
};

export default withProtectPage(withAuth(ReviewsPage), (user, ctx) => {
    return staffCheck(user, ctx);
});
