import { useRouter } from "next/router";
import Course from "../../../components/Course/Course";
import { withAuth } from "../../../context/auth";

const CoursePage = (props) => {
    const router = useRouter();
    const { course } = router.query;

    return (
        <Course
            courseId={course}
            course={props.course}
            memberships={props.memberships}
            invites={props.invites}
            leadership={props.leadership}
        />
    );
};

CoursePage.getInitialProps = async (context) => {
    const { query, req } = context;
    const data = {
        headers: { cookie: req.headers.cookie },
    };

    // TODO: make a util function for the domain
    const [course, memberships, invites, leadership] = await Promise.all([
        fetch(
            `http://localhost:3000/api/courses/${query.course}/`,
            data
        ).then((res) => res.json()),
        fetch(
            `http://localhost:3000/api/courses/${query.course}/members/`,
            data
        ).then((res) => res.json()),
        fetch(
            `http://localhost:3000/api/courses/${query.course}/invites/`,
            data
        ).then((res) => res.json()),
        fetch(
            `http://localhost:3000/api/courses/${query.course}/leadership/`,
            data
        ).then((res) => res.json()),
    ]);
    return { course, memberships, invites, leadership };
};
export default withAuth(CoursePage);
