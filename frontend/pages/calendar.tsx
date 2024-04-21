import Head from "next/head";
import { Grid } from "semantic-ui-react";
import { NextPageContext } from "next";
import CourseWrapper from "../../../components/Course/CourseWrapper";
import Calendar from "../../../components/Course/Calendar/InstructorCalendar";
import { doMultipleSuccessRequests } from "../../../utils/fetch";
import { isLeadershipRole } from "../../../utils/enums";
import { withAuth } from "../../../context/auth";
import { CoursePageProps, Course, Membership } from "../../../types";
import nextRedirect from "../../../utils/redirect";

const CalendarPage = (props: CoursePageProps) => {
    const { course, leadership } = props;

    return (
        <>
            <Head>
                <title>OHQ | Calendar</title>
            </Head>
            <Grid columns="equal" divided style={{ width: "100%" }} stackable>
                <Calendar courseId={course.id} />
            </Grid>
        </>
    );
};

CalendarPage.getInitialProps = async (
    context: NextPageContext
): Promise<CoursePageProps> => {
    const { query, req } = context;
    const data = {
        headers: req ? { cookie: req.headers.cookie } : undefined,
    };

    let course: Course;
    let leadership: Membership[];
    const response = await doMultipleSuccessRequests([
        { path: `/api/courses/${query.course}/`, data },
        { path: `/api/courses/${query.course}/members/`, data },
    ]);

    if (response.success) {
        [course, leadership] = response.data;
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
    };
};

export default withAuth(CalendarPage);
