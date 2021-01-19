import React, { useState } from "react";
import { Segment, Header, Dropdown, Icon } from "semantic-ui-react";
import Link from "next/link";
import { UserMembership, Kind } from "../../../../types";

interface CourseCardProps {
    membership: UserMembership;
    setOpenLeave?: (open: boolean) => void;
    setLeaveMembership?: (membership: UserMembership) => void;
}

const CourseCard = (props: CourseCardProps) => {
    const { membership, setOpenLeave, setLeaveMembership } = props;
    const { course } = membership;
    const [hover, setHover] = useState(false);

    const path = {
        pathname: `/courses/${course.id}`,
    };

    const handleLeave = () => {
        if (setLeaveMembership && setOpenLeave) {
            setLeaveMembership(membership);
            setOpenLeave(true);
        }
    };

    return (
        <Segment basic>
            <Link href="/courses/[courseId]" as={`/courses/${course.id}`}>
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
                            {membership.kind === Kind.STUDENT && (
                                <Dropdown
                                    icon={
                                        <Icon
                                            name="ellipsis vertical"
                                            style={{
                                                width: "auto",
                                                margin: "0",
                                                paddingLeft: "4px",
                                            }}
                                        />
                                    }
                                    direction="left"
                                    style={{ float: "right" }}
                                >
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={handleLeave}>
                                            Leave
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            )}
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
