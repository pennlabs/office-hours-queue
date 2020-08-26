import React, { useState, useContext } from "react";
import {
    Segment,
    Menu,
    Grid,
    Image,
    Header,
    List,
    Icon,
} from "semantic-ui-react";
import { useRouter } from "next/router";
import { prettifyRole } from "../../utils/enums";

import AboutModal from "../LandingPage/AboutModal";
import { AuthUserContext } from "../../context/auth";
import { useLeadership, useStaff } from "../../hooks/data-fetching/course";
import styles from "../../styles/landingpage.module.css";
import { leadershipSortFunc } from "../../utils";
import { Membership } from "../../types";

interface CourseSidebarProps {
    courseId: number;
    leadership: Membership[];
}
const CourseSidebar = (props: CourseSidebarProps) => {
    const { courseId, leadership: leadershipRaw } = props;
    const [leadershipUnsorted, , , ,] = useLeadership(courseId, leadershipRaw);
    const leadership = leadershipUnsorted.sort(leadershipSortFunc);

    const { user: initialUser } = useContext(AuthUserContext);
    if (!initialUser) {
        throw new Error(
            "Invariant broken, withAuth must be used with component"
        );
    }

    const [leader, staff, , ,] = useStaff(courseId, initialUser);

    const noWrapStyle = {
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
    };
    const [showAboutModal, setShowAboutModal] = useState(false);

    const router = useRouter();

    return (
        <Grid.Column width={3}>
            <Segment basic>
                <Image
                    src="../../../ohq.png"
                    size="tiny"
                    href="/"
                    style={{ marginTop: "10px" }}
                />
                <Menu vertical secondary fluid>
                    <Menu.Item
                        style={noWrapStyle}
                        name="Queues"
                        icon="hourglass one"
                        href={`/courses/${courseId}`}
                        active={router.pathname.endsWith("[course]")}
                        color="blue"
                    />
                    {staff && (
                        <Menu.Item
                            style={noWrapStyle}
                            name="Roster"
                            icon="users"
                            href={`/courses/${courseId}/roster`}
                            active={router.pathname.endsWith("roster")}
                            color="blue"
                        />
                    )}
                    {staff && (
                        <Menu.Item
                            style={noWrapStyle}
                            name="Analytics"
                            icon="chart bar"
                            href={`/courses/${courseId}/analytics`}
                            active={router.pathname.endsWith("analytics")}
                            color="blue"
                        />
                    )}
                    {staff && (
                        <Menu.Item
                            style={noWrapStyle}
                            name="Question Summary"
                            icon="list ol"
                            href={`/courses/${courseId}/summary`}
                            active={router.pathname.endsWith("summary")}
                            color="blue"
                        />
                    )}
                    {leader && (
                        <Menu.Item
                            style={noWrapStyle}
                            name="Course Settings"
                            icon="settings"
                            href={`/courses/${courseId}/settings`}
                            active={router.pathname.endsWith("settings")}
                            color="blue"
                        />
                    )}
                </Menu>
            </Segment>
            {leadership && (
                <Segment basic>
                    <Header as="h3">Instructors</Header>
                    <List>
                        {leadership.map((membership) => {
                            return (
                                <List.Item
                                    key={membership.id}
                                    style={{ marginBottom: "8px" }}
                                >
                                    <Icon name="user" />
                                    <List.Content>
                                        <List.Header
                                            as="a"
                                            target="_blank"
                                            href={`mailto:${membership.user.email}`}
                                        >
                                            {`${membership.user.firstName} ${membership.user.lastName}`}
                                        </List.Header>
                                        <List.Description>
                                            {prettifyRole(membership.kind)}
                                        </List.Description>
                                    </List.Content>
                                </List.Item>
                            );
                        })}
                    </List>
                </Segment>
            )}
            <div
                role="button"
                className={`${styles.about} ${styles["about-dashboard"]}`}
                onClick={() => setShowAboutModal(true)}
            >
                <p>Feedback</p>
            </div>
            <AboutModal
                open={showAboutModal}
                closeFunc={() => setShowAboutModal(false)}
            />
        </Grid.Column>
    );
};

export default CourseSidebar;
