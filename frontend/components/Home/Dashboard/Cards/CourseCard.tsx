import React, { useState } from "react";
import { Segment, Header } from "semantic-ui-react";
import Link from "next/link";
import * as ROUTES from "../../../../constants/routes";

const CourseCard = (props) => {
    const [hover, setHover] = useState(false);

    const path = {
        pathname: `${ROUTES.CLASS.split("/:")[0]}/${props.id}`,
    };

    return (
        <Segment basic>
            <Link href={path}>
                <Segment.Group
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
                                overflow: "hidden",
                            }}
                        >
                            {`${props.department} ${props.courseCode}`}
                            <Header.Subheader
                                style={{
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                }}
                            >
                                {props.courseTitle}
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
                            {props.semester}
                        </Header>
                    </Segment>
                </Segment.Group>
            </Link>
        </Segment>
    );
};

export default CourseCard;
