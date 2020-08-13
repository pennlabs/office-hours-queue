import { useRouter } from "next/router";
import Course from "../../../components/Course/Course";
import { withAuth } from "../../../context/auth";

const CoursePage = (props) => {
    const router = useRouter();
    const { course } = router.query;
    return <Course courseId={course} course={props.course} />;
};

export async function getInitialProps(context) {
    const { params, req } = context;
    const data = {
        headers: { cookie: req.headers.cookie },
    };
    // TODO: make a util function for the domain
    const resp = await fetch(
        `http://localhost:3000/api/courses/${params.course}/`,
        data
    );
    const course = await resp.json();
    return { props: { course } };
}
export default withAuth(CoursePage);
