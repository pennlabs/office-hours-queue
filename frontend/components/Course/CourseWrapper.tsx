import { useContext, MutableRefObject } from "react";
import { Grid, Segment, Header, Icon, Popup } from "semantic-ui-react";
import { useMediaQuery } from "@material-ui/core";
import CourseSidebar from "./CourseSidebarNav";

import { AuthUserContext } from "../../context/auth";
import { useCourse, useStaff } from "../../hooks/data-fetching/course";
import * as bellAudio from "./InstructorQueuePage/notification.mp3";
import * as aolAudio from "./InstructorQueuePage/aol.mp3";
import Footer from "../common/Footer";
import { usePlayer } from "../../hooks/player";
import { Course as CourseType, Membership } from "../../types";
import CourseSidebarInstructorList from "./CourseSidebarInstructorList";

interface CourseProps {
    render: (
        staff: boolean,
        play: MutableRefObject<(string) => void | undefined>,
        notifs?: boolean,
        setNotifs?: (boolean) => void
    ) => JSX.Element;
    course: CourseType;
    leadership: Membership[];
    notificationUI?: boolean;
}

const CourseWrapper = ({ render, ...props }: CourseProps) => {
    const { course: rawCourse, leadership, notificationUI } = props;
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

    const toggleNotifs = () => {
        setNotifs(!notifs);
        localStorage.setItem("notifs", !notifs ? "true" : "false");
        document.body.focus();
    };

    const isMobile = useMediaQuery("(max-width: 600px)"); // TODO: use variable

    return course ? (
        // Need to override semantic UI Grid.Row's display: flex for instructor list to clear the row
        <Grid.Row style={{ display: "block" }}>
            <Grid.Column width={3}>
                <CourseSidebar course={course} />
            </Grid.Column>
            <Grid.Column
                width={13}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    float: "right",
                    ...(!isMobile && { height: "100%" }),
                }}
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

                        {notificationUI && (
                            <Grid.Column>
                                <Segment basic>
                                    <div
                                        style={{
                                            float: "right",
                                            paddingTop: "0.71rem",
                                        }}
                                    >
                                        <Popup
                                            trigger={
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
                                            }
                                        >
                                            <p>
                                                Browser permissions are{" "}
                                                {typeof Notification !==
                                                    "undefined" && (
                                                    <strong>
                                                        {
                                                            Notification.permission
                                                        }
                                                    </strong>
                                                )}
                                                .
                                            </p>
                                            {typeof Notification !==
                                                "undefined" &&
                                                Notification.permission ==
                                                    "denied" && (
                                                    <p>
                                                        Enable notification
                                                        permisions to receive
                                                        browser notifications.
                                                    </p>
                                                )}
                                        </Popup>
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
                        )}
                    </Grid>
                )}
                <Segment basic>
                    {render(staff, play, notifs, setNotifs)}
                </Segment>
                <Footer />
            </Grid.Column>
            <Grid.Column style={{ clear: "left" }} width={3}>
                {leadership && (
                    <CourseSidebarInstructorList
                        courseId={course.id}
                        leadership={leadership}
                    />
                )}
            </Grid.Column>
        </Grid.Row>
    ) : (
        <></>
    );
};

export default CourseWrapper;
