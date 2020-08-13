import { useRouter } from "next/router";
import Roster from "../../../components/Course/Roster/Roster";
import CourseSidebar from "../../../components/Course/CourseSidebar";
import { Grid, Segment, Header } from "semantic-ui-react";

const RosterPage = (props) => {
    const router = useRouter();
    const { course } = router.query;
    const courseId = parseInt(course);
    return [
        <CourseSidebar courseId={courseId} />,
        <Grid.Column width={13}>
            {props.course.department && (
                <Grid.Row>
                    <Segment basic>
                        <Header as="h1">
                            {props.course.department +
                                " " +
                                props.course.courseCode}
                            <Header.Subheader>
                                {props.course.courseTitle}
                            </Header.Subheader>
                        </Header>
                    </Segment>
                </Grid.Row>
            )}
            <Roster courseId={courseId} />
        </Grid.Column>,
    ];
};

export async function getServerSideProps(context) {
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

export default RosterPage;
