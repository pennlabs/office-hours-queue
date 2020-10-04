import React, { useState } from "react";
import { Segment, Header, Dropdown, Icon } from "semantic-ui-react";
import Link from "next/link";
import { Course } from "../../../../types";

interface CourseCardProps {
    course: Course;
}
const CourseCard = (props: CourseCardProps) => {
    const { course } = props;
    const [hover, setHover] = useState(false);

    const path = {
        pathname: `/courses/${course.id}`,
    };

    return (
        <Segment basic>
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
                            <Dropdown icon={
                                    <Icon name="ellipsis vertical" style={{ width: "auto", margin: "0" }}/>
                                }
                                direction="left"
                                style={{ float: "right"}}
                            >
                                <Dropdown.Menu>
                                    <Dropdown.Item>
                                        Leave
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
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
