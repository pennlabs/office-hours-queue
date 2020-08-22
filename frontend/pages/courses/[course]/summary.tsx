import React from "react";
import { useRouter } from "next/router";
import { Grid } from "semantic-ui-react";
import CourseWrapper from "../../../components/Course/CourseWrapper";
import { withAuth } from "../../../context/auth";
import { doApiRequest } from "../../../utils/fetch";
import { isLeadershipRole } from "../../../utils/enums";
import CourseSettings from "../../../components/Course/CourseSettings/CourseSettings";
import Summary from "../../../components/Course/Summary/Summary";

const CoursePage = (props) => {
    const router = useRouter();
    const { course: courseId } = router.query;
    const { course, memberships, invites, leadership } = props;
    return (
        <Grid columns="equal" divided style={{ width: "100%" }} stackable>
            <CourseWrapper
                // TODO: better fix
                // @ts-ignore
                courseId={parseInt(courseId, 10)}
                course={course}
                memberships={memberships}
                invites={invites}
                leadership={leadership}
                render={(props) => <Summary {...props} />}
            />
        </Grid>
    );
};

CoursePage.getInitialProps = async (context) => {
    const { query, req } = context;
    const data = {
        headers: req ? { cookie: req.headers.cookie } : undefined,
    };
    const [course, memberships, invites, leadership] = await Promise.all([
        doApiRequest(`/courses/${query.course}/`, data).then((res) =>
            res.json()
        ),
        doApiRequest(`/courses/${query.course}/members/`, data).then((res) =>
            res.json()
        ),
        doApiRequest(`/courses/${query.course}/invites/`, data).then((res) =>
            res.json()
        ),
        doApiRequest(`/courses/${query.course}/members/`, data).then((res) =>
            res.json()
        ),
    ]);
    return {
        course,
        memberships,
        invites,
        leadership: leadership.filter((m) => isLeadershipRole(m.kind)),
    };
};
export default withAuth(CoursePage);
