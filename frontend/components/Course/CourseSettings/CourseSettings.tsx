import { Segment, Header, Grid } from "semantic-ui-react";
import { useContext } from "react";
import CourseForm from "./CourseForm";
import { Course, Tag, UserMembership } from "../../../types";
import { useCourse, useMembership } from "../../../hooks/data-fetching/course";
import { AuthUserContext } from "../../../context/auth";

interface CourseSettingsProps {
    course: Course;
    tags: Tag[];
    membership: UserMembership;
}

const CourseSettings = (props: CourseSettingsProps) => {
    const { course: rawCourse, tags, membership: rawMembership } = props;
    const { data: courseData, mutate: mutateCourse } = useCourse(
        rawCourse.id,
        rawCourse
    );
    const { data: membershipData, mutate: mutateMembership } = useMembership(
        rawCourse.id,
        rawMembership.id,
        rawMembership
    );

    const { user: initialUser } = useContext(AuthUserContext);
    if (!initialUser) {
        throw new Error(
            "Invariant broken, withAuth must be used with component"
        );
    }

    // courseData and membershipData are non null because initialData is provided
    // and the key stays the same
    const course = courseData!;
    const membership = membershipData!;

    return (
        <div>
            <Grid.Row>
                <Segment basic>
                    <Header as="h3">Course Settings</Header>
                </Segment>
            </Grid.Row>
            <Grid.Row>
                <Segment basic>
                    <CourseForm
                        course={course}
                        mutateCourse={mutateCourse}
                        tags={tags}
                        membership={membership}
                        mutateMembership={mutateMembership}
                    />
                </Segment>
            </Grid.Row>
        </div>
    );
};

export default CourseSettings;
