import React, { useState } from "react";
import { Grid, Segment, Header, Menu, Divider } from "semantic-ui-react";

import InstructorGuide from "./InstructorGuide";

export default function Guide() {
    const [tab, setTab] = useState("instructors");

    const handleClick = (e, { name }) => setTab(name);

    return (
        <Grid.Column width={13} style={{ padding: "2rem" }}>
            <Grid.Row>
                <Header as="h2">
                    <Header.Content>Frequently Asked Questions</Header.Content>
                </Header>
                <Menu>
                    <Menu.Item
                        name="general"
                        active={tab === "general"}
                        onClick={handleClick}
                    >
                        General
                    </Menu.Item>
                    <Menu.Item
                        name="students"
                        active={tab === "students"}
                        onClick={handleClick}
                    >
                        For Students
                    </Menu.Item>
                    <Menu.Item
                        name="instructors"
                        active={tab === "instructors"}
                        onClick={handleClick}
                    >
                        For Instructors
                    </Menu.Item>
                </Menu>
            </Grid.Row>
            <Grid.Row style={{ marginTop: "2rem" }}>
                {tab === "instructors" && <InstructorGuide />}
            </Grid.Row>
        </Grid.Column>
    );
}
