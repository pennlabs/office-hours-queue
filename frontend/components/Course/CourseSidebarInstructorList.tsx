import React from "react";
import { Header, Icon, List, Segment } from "semantic-ui-react";
import { useLeadership } from "../../hooks/data-fetching/course";
import { Membership } from "../../types";
import { leadershipSortFunc } from "../../utils";
import { prettifyRole } from "../../utils/enums";
import styles from "../../styles/landingpage.module.css";

interface CourseSidebarInstructorListProps {
    courseId: number;
    leadership: Membership[];
}

const CourseSidebarInstructorList = ({
    courseId,
    leadership: leadershipRaw,
}: CourseSidebarInstructorListProps) => {
    const { leadership: leadershipUnsorted } = useLeadership(
        courseId,
        leadershipRaw
    );
    const leadership = leadershipUnsorted.sort(leadershipSortFunc);

    return (
        <>
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
            <div
                role="button"
                className={`${styles.about} ${styles["about-dashboard"]}`}
            >
                <a
                    href="https://airtable.com/shrIZxIjyAE3gOUSg"
                    target="_blank"
                    rel="noreferrer"
                >
                    <p>Feedback</p>
                </a>
            </div>
        </>
    );
};
export default CourseSidebarInstructorList;
