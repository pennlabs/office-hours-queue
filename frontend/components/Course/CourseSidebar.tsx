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
import Link from "next/link";
import { prettifyRole } from "../../utils/enums";

import { AuthUserContext } from "../../context/auth";
import { useLeadership, useStaff } from "../../hooks/data-fetching/course";
import styles from "../../styles/landingpage.module.css";
import { leadershipSortFunc } from "../../utils";
import { Membership, Course } from "../../types";

interface CourseSidebarProps {
    course: Course;
    leadership: Membership[];
}
const CourseSidebar = (props: CourseSidebarProps) => {
    const { course, leadership: leadershipRaw } = props;
    const courseId = course.id;
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
                    {!course.archived && (
                        <Link
                            href="/courses/[courseId]"
                            as={`/courses/${courseId}`}
                        >
                            <Menu.Item
                                style={noWrapStyle}
                                name="Queues"
                                icon="hourglass one"
                                active={router.pathname.endsWith("[course]")}
                                color="blue"
                            />
                        </Link>
                    )}
                    {staff && (
                        <Link
                            href="/courses/[courseId]/roster"
                            as={`/courses/${courseId}/roster`}
                        >
                            <Menu.Item
                                style={noWrapStyle}
                                name="Roster"
                                icon="users"
                                active={router.pathname.endsWith("roster")}
                                color="blue"
                            />
                        </Link>
                    )}
                    {staff && (
                        <Link
                            href="/courses/[courseId]/analytics"
                            as={`/courses/${courseId}/analytics`}
                        >
                            <Menu.Item
                                style={noWrapStyle}
                                name="Analytics"
                                icon="chart bar"
                                active={router.pathname.endsWith("analytics")}
                                color="blue"
                            />
                        </Link>
                    )}
                    {staff && (
                        <Link
                            href="/courses/[courseId]/summary"
                            as={`/courses/${courseId}/summary`}
                        >
                            <Menu.Item
                                style={noWrapStyle}
                                name="Question Summary"
                                icon="list ol"
                                active={router.pathname.endsWith("summary")}
                                color="blue"
                            />
                        </Link>
                    )}
                    {!course.archived && leader && (
                        <Link
                            href="/courses/[courseId]/settings"
                            as={`/courses/${courseId}/settings`}
                        >
                            <Menu.Item
                                style={noWrapStyle}
                                name="Course Settings"
                                icon="settings"
                                href={`/courses/${courseId}/settings`}
                                active={router.pathname.endsWith("settings")}
                                color="blue"
                            />
                        </Link>
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
            >
                <a
                    href="https://airtable.com/shrIZxIjyAE3gOUSg"
                    target="_blank"
                >
                    <p>Feedback</p>
                </a>
            </div>
        </Grid.Column>
    );
};

export default CourseSidebar;
