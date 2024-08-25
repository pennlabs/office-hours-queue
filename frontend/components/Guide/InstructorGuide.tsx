import { Segment, List } from "semantic-ui-react";

import {
    CreateCourse,
    InviteMembers,
    CreateQueue,
    HoldOfficeHours,
    Analytics,
    Calendar,
    Settings,
} from "./InstructorGuideContent";
import { useSection } from "./utils";

export default function InstructorGuide() {
    const [CreateCourseHeader, CreateCourseBody] = useSection(
        "Create your course",
        CreateCourse
    );
    const [InviteMembersHeader, InviteMembersBody] = useSection(
        "Invite Students and Instructors",
        InviteMembers
    );
    const [CreateQueueHeader, CreateQueueBody] = useSection(
        "Create a Queue",
        CreateQueue
    );
    const [CalendarHeader, CalendarBody] = useSection(
        "Editing a Course Calendar",
        Calendar
    );
    const [HoldOHHeader, HoldOHBody] = useSection(
        "Hold Office Hours",
        HoldOfficeHours
    );

    const [AnalyticsHeader, AnalyticsBody] = useSection("Analytics", Analytics);

    const [SettingsHeader, SettingsBody] = useSection("Settings", Settings);

    return (
        <>
            <Segment basic>
                <b>Jump to:</b>
                <List bulleted>
                    <CreateCourseHeader />
                    <InviteMembersHeader />
                    <CreateQueueHeader />
                    <HoldOHHeader />
                    <AnalyticsHeader />
                    <CalendarHeader />
                    <SettingsHeader />
                </List>
            </Segment>

            <CreateCourseBody />
            <InviteMembersBody />
            <CreateQueueBody />
            <HoldOHBody />
            <AnalyticsBody />
            <CalendarBody />
            <SettingsBody />
        </>
    );
}
