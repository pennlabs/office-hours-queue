import React from "react";
import { Segment, List } from "semantic-ui-react";

import {
    CreateCourse,
    InviteMembers,
    CreateQueue,
    HoldOfficeHours,
    Analytics,
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
    const [HoldOHHeader, HoldOHBody] = useSection(
        "Hold Office Hours",
        HoldOfficeHours
    );

    const [AnalyticsHeader, AnalyticsBody] = useSection("Analytics", Analytics);

    const [SettingsHeader, SettingsBody] = useSection("Settings", Settings);

    return (
        <>
            <Segment basic>
                Hi there! 🎉
                <br />
                Welcome to OHQ, a centralized online office hours system that
                helps instructors like you manage office hours easily and
                intuitively, so you can focus on teaching and your students can
                focus on learning in office hours. This guide will walk you
                through using OHQ, so your experience holding office hours can
                be as easy and straightforward as possible.
            </Segment>

            <Segment basic>
                <b>Jump to:</b>
                <List bulleted>
                    <CreateCourseHeader />
                    <InviteMembersHeader />
                    <CreateQueueHeader />
                    <HoldOHHeader />
                    <AnalyticsHeader />
                    <SettingsHeader />
                </List>
            </Segment>

            <CreateCourseBody />
            <InviteMembersBody />
            <CreateQueueBody />
            <HoldOHBody />
            <AnalyticsBody />
            <SettingsBody />
            <p>
                Have any lingering questions? Please email us at contact@ohq.io
                - we&apos;re happy to help!
            </p>
        </>
    );
}
