import { Card, Header } from "semantic-ui-react";
import React from "react";
import AnalyticsCard from "./AnalyticsCard";

export default function Cards() {
    return (
        <>
            <Header as="h3">At a Glance</Header>
            <Card.Group>
                <AnalyticsCard label="Average Wait Time" content="34 minutes" />
                <AnalyticsCard
                    label="Average Queue Length"
                    content="4 students"
                />
                <AnalyticsCard
                    label="Questions Answered"
                    content="14 questions"
                />
                <AnalyticsCard label="Students Helped" content="12 students" />
                <AnalyticsCard
                    label="Average Time per Student"
                    content="8 minutes"
                />
            </Card.Group>
        </>
    );
}
