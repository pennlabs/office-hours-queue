import React, { useContext, MutableRefObject } from "react";
import { Grid, Segment, Header, Icon, ButtonProps } from "semantic-ui-react";
import CourseSidebar from "./CourseSidebar";

import { AuthUserContext } from "../../context/auth";
import { useCourse, useStaff } from "../../hooks/data-fetching/course";
import * as bellAudio from "./InstructorQueuePage/notification.mp3";
import * as aolAudio from "./InstructorQueuePage/aol.mp3";
import Footer from "../common/Footer";
import { usePlayer } from "../../hooks/player";
import { Course as CourseType, Membership } from "../../types";

interface CourseProps {
    render: (
        staff: boolean,
        play: MutableRefObject<(() => void) | undefined>
    ) => JSX.Element;
    course: CourseType;
    leadership: Membership[];
}

const CourseWrapper = ({ render, ...props }: CourseProps) => {
    const { course: rawCourse, leadership } = props;
    const { data: course } = useCourse(rawCourse.id, rawCourse);

    const { user: initialUser } = useContext(AuthUserContext);
    if (!initialUser) {
        throw new Error(
            "Invariant broken: withAuth must be used with component"
        );
    }

    const { staff } = useStaff(rawCourse.id, initialUser);

    const isAprilFirst = false;
    const [notifs, setNotifs, play] = usePlayer(
        isAprilFirst ? aolAudio : bellAudio
    );

    const toggleNotifs = (
        event: React.MouseEvent<HTMLButtonElement>,
        data: ButtonProps
    ) => {
        setNotifs(!notifs);
        document.body.focus();
    };

    return course ? (
        <>
            <CourseSidebar course={course} leadership={leadership} />
            <Grid.Column
                width={13}
                style={{ display: "flex", flexDirection: "column" }}
            >
                {course.department && (
                    <Grid columns="equal" style={{ marginBottom: "-2rem" }}>
                        <Grid.Column>
                            <Segment basic>
                                <Header as="h1">
                                    {`${course.department} ${course.courseCode}`}
                                    <Header.Subheader>
                                        {course.courseTitle}
                                    </Header.Subheader>
                                </Header>
                            </Segment>
                        </Grid.Column>

                        <Grid.Column>
                            <Segment basic>
                                <div
                                    style={{
                                        float: "right",
                                        paddingTop: "0.71rem",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "inline",
                                            position: "relative",
                                            top: "0.14rem",
                                            fontSize: "1.29rem",
                                            fontFamily: "Lato",
                                            color: "#666666",
                                        }}
                                    >
                                        Notifications are{" "}
                                        {notifs ? "ON" : "OFF"}
                                    </div>
                                    <Icon
                                        size="large"
                                        style={{
                                            paddingLeft: "0.71rem",
                                            cursor: "pointer",
                                            color: "rgba(0, 0, 0, 0.6)",
                                        }}
                                        name={
                                            notifs
                                                ? "bell outline"
                                                : "bell slash outline"
                                        }
                                        onClick={toggleNotifs}
                                    />
                                </div>
                            </Segment>
                        </Grid.Column>
                    </Grid>
                )}
                <Segment basic>{render(staff, play)}</Segment>
                <Footer />
            </Grid.Column>
        </>
    ) : (
        <></>
    );
};

export default CourseWrapper;
