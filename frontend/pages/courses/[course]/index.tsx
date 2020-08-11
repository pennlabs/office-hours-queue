import { useRouter } from 'next/router'
import Course from "../../../components/Course/Course"

const CoursePage = ({ }) => {
    const router = useRouter()
    const { course } = router.query
    return (
        <Course {...course} />
        // <Grid
        //     columns={2}
        //     divided="horizontally"
        //     style={{ width: "100%" }}
        //     stackable
        // >
        //     <HomeSidebar active={active} clickFunc={setActive} />
        //     <AccountSettings />
        // </Grid>
    );
};

export default CoursePage;
