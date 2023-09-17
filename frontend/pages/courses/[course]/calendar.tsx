import Head from "next/head";
import { Grid } from "semantic-ui-react";
import { NextPageContext } from "next";
import CourseWrapper from "../../../components/Course/CourseWrapper";
import Calender from "../../../components/Course/Calender";
import { doMultipleSuccessRequests } from "../../../utils/fetch";
import { isLeadershipRole } from "../../../utils/enums";
import { withAuth } from "../../../context/auth";
import { CoursePageProps, Course, Membership, Event } from "../../../types";
import nextRedirect from "../../../utils/redirect";
import { useEvents } from "../../../hooks/data-fetching/calendar";

interface CalendarPageProps extends CoursePageProps {
    events: Event[];
}

const CalendarPage = (props: CalendarPageProps) => {
    const { course, leadership, events } = props;
    const { data, mutate } = useEvents(course.id, events);
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
                            <Calender
                                courseId={course.id}
                                events={data || []}
                                mutate={mutate}
                            />
                        );
                    }}
                />
            </Grid>
        </>
    );
};

CalendarPage.getInitialProps = async (
    context: NextPageContext
): Promise<CalendarPageProps> => {
    const { query, req } = context;
    const data = {
        headers: req ? { cookie: req.headers.cookie } : undefined,
    };

    let course: Course;
    let leadership: Membership[];
    let events: Event[];
    const response = await doMultipleSuccessRequests([
        { path: `/api/courses/${query.course}/`, data },
        { path: `/api/courses/${query.course}/members/`, data },
        {
            path: `/api/occurrences/?course=${query.course}&filter_start=2022-01-01T12:00:00Z&end=2023-01-01T12:00:00Z&filter_end=2023-01-01T12:00:00Z&end=2023-01-01T12:00:00Z`,
            data,
        },
    ]);

    if (response.success) {
        [course, leadership, events] = response.data;
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
        events,
    };
};

export default withAuth(CalendarPage);
