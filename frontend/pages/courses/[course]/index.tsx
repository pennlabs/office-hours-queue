import { useRouter } from "next/router";
import Course from "../../../components/Course/Course";

const CoursePage = (props) => {
    const router = useRouter();
    const { course } = router.query;
    return (
        <Course courseId={course} course={props.course} />
    );
};

export async function getServerSideProps(context) {
    const { params, req } = context
    const data = {
        headers: req ? { cookie: req.headers.cookie } : undefined,
    }
    // TODO: make a util function for the domain
    const resp = await fetch(`http://localhost:3000/api/courses/${params.course}/`, data);
    const course = await resp.json()
    return { props: { course } };
}
export default CoursePage;
