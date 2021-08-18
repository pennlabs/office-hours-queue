import { useState } from "react";
import Link from "next/link";
import { Segment, Header } from "semantic-ui-react";
import { Course } from "../../../../types";

interface ArchivedCourseCardProps {
    course: Course;
}
const ArchivedCourseCard = (props: ArchivedCourseCardProps) => {
    const { course } = props;
    const [hover, setHover] = useState(false);
    return (
        <Segment basic>
            <Link
                href="/courses/[course]/roster"
                as={`/courses/${course.id}/roster`}
            >
                <Segment.Group
                    style={{ cursor: "pointer" }}
                    raised={hover}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                >
                    <Segment attached="top" color="blue">
                        <Header
                            style={{
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                            }}
                        >
                            {`${course.department} ${course.courseCode}`}
                            <Header.Subheader
                                style={{
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                }}
                            >
                                {course.courseTitle}
                            </Header.Subheader>
                        </Header>
                    </Segment>
                    <Segment attached="bottom" secondary textAlign="right">
                        <Header
                            as="h6"
                            style={{
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                            }}
                        >
                            {course.semesterPretty}
                        </Header>
                    </Segment>
                </Segment.Group>
            </Link>
        </Segment>
    );
};

export default ArchivedCourseCard;
