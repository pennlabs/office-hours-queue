import React from "react";
import { Segment, Header } from "semantic-ui-react";
import { Course } from "../../../../types";

interface ArchivedCourseCardProps {
    course: Course;
}
const ArchivedCourseCard = (props: ArchivedCourseCardProps) => {
    const course = props.course;
    return (
        <Segment basic>
            <Segment attached="top" color="blue" secondary>
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
            <Segment attached="bottom" tertiary textAlign="right">
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
        </Segment>
    );
};

export default ArchivedCourseCard;
