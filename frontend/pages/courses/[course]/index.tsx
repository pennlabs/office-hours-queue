import React from "react";
import { Grid } from "semantic-ui-react";
import { NextPageContext } from "next";
import CourseWrapper from "../../../components/Course/CourseWrapper";
import { withAuth } from "../../../context/auth";
import { doApiRequest } from "../../../utils/fetch";
import { isLeadershipRole } from "../../../utils/enums";
import { CoursePageProps } from "../../../types";
import InstructorQueuePage from "../../../components/Course/InstructorQueuePage/InstructorQueuePage";
import StudentQueuePage from "../../../components/Course/StudentQueuePage/StudentQueuePage";

const CoursePage = (props: CoursePageProps) => {
    const { course, leadership } = props;
    return (
        <Grid columns="equal" divided style={{ width: "100%" }} stackable>
            <CourseWrapper
                course={course}
                leadership={leadership}
                render={(staff: boolean) => {
                    return (
                        <>
                            {staff && (
                                <InstructorQueuePage courseId={course.id} />
                            )}
                            {!staff && <StudentQueuePage course={course} />}
                        </>
                    );
                }}
            />
        </Grid>
    );
};

CoursePage.getInitialProps = async (
    context: NextPageContext
): Promise<CoursePageProps> => {
    const { query, req } = context;
    const data = {
        headers: req ? { cookie: req.headers.cookie } : undefined,
    };
    const [course, leadership] = await Promise.all([
        doApiRequest(`/courses/${query.course}/`, data).then((res) =>
            res.json()
        ),
        doApiRequest(`/courses/${query.course}/members/`, data).then((res) =>
            res.json()
        ),
    ]);
    return {
        course,
        leadership: leadership.filter((m) => isLeadershipRole(m.kind)),
    };
};
export default withAuth(CoursePage);
