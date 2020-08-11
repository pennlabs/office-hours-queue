import { useRouter } from "next/router";
import Course from "../../../components/Course/Course";

const CoursePage = ({ }) => {
    const router = useRouter();
    const { course } = router.query;
    return (
        <Course courseId={course} />
    );
};

export default CoursePage;
