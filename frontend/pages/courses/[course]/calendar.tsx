import Head from "next/head";
import { Grid } from "semantic-ui-react";
import { NextPageContext } from "next";
import CourseWrapper from "../../../components/Course/CourseWrapper";
import Calender from "../../../components/Calender";
import { doMultipleSuccessRequests } from "../../../utils/fetch";
import { isLeadershipRole } from "../../../utils/enums";
import { withAuth } from "../../../context/auth";
import { CoursePageProps, Course, Membership } from "../../../types";
import nextRedirect from "../../../utils/redirect";

interface SettingsPageProps extends CoursePageProps {}

const CalendarPage = (props: SettingsPageProps) => {
    const { course, leadership } = props;
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
                        return <Calender />;
                    }}
                />
            </Grid>
        </>
    );
};

CalendarPage.getInitialProps = async (
    context: NextPageContext
): Promise<SettingsPageProps> => {
    const { query, req } = context;
    const data = {
        headers: req ? { cookie: req.headers.cookie } : undefined,
    };

    let course: Course;
    let leadership: Membership[];
    let events: any;
    console.log(query.course);
    console.log(data);
    const response = await doMultipleSuccessRequests([
        { path: `/api/courses/${query.course}/`, data },
        { path: `/api/courses/${query.course}/members/`, data },
        { path: "/api/events/", data },
    ]);

    if (response.success) {
        [course, leadership, events] = response.data;
        console.log("SUCCESS");
        console.log(events);
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
