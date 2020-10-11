import React, { useState } from "react";
import { Segment, Header, Dropdown, Icon } from "semantic-ui-react";
import Link from "next/link";
import { Course, mutateFunction, UserMembership } from "../../../../types";
import ModalLeaveStudentCourse from "../Modals/ModalLeaveStudentCourse";

interface CourseCardProps {
    course: Course;
    mutate: mutateFunction<UserMembership[]>;
    isStudent: boolean;
}

const CourseCard = (props: CourseCardProps) => {
    const { course, mutate, isStudent } = props;
    const [hover, setHover] = useState(false);
    const [showLeave, setShowLeave] = useState(false);

    const path = {
        pathname: `/courses/${course.id}`,
    };

    return (
        <Segment basic>
            {isStudent ? <ModalLeaveStudentCourse
                open={showLeave}
                closeFunc={() => {setShowLeave(false)}}
                course={course}
                mutate={mutate}
            /> : undefined}
            <Link href={path}>
                <Segment.Group
                    style={{
                        cursor: "pointer",
                    }}
                    raised={hover}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                >
                    <Segment
                        attached="top"
                        color="blue"
                        style={{ height: "80px", paddingTop: "20px" }}
                    >
                        <Header
                            style={{
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {`${course.department} ${course.courseCode}`}
                            {isStudent ? <Dropdown icon={
                                    <Icon
                                        name="ellipsis vertical"
                                        style={{ width: "auto", margin: "0", paddingLeft: "4px" }}
                                    />
                                }
                                direction="left"
                                style={{ float: "right"}}
                            >
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => setShowLeave(true)}>
                                        Leave
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown> : undefined}
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
                    <Segment
                        attached="bottom"
                        secondary
                        textAlign="right"
                        style={{ height: "40px" }}
                    >
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

export default CourseCard;
