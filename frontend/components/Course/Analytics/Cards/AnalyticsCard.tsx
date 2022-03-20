import { Card, Header } from "semantic-ui-react";
import React from "react";

interface AnalyticsCardProps {
    label: string;
    content: string;
}

export default function AnalyticsCard({ label, content }: AnalyticsCardProps) {
    return (
        <Card
            style={{
                width: "200px",
                backgroundColor: "#F3F4F5",
                borderColor: "#D4D4D5",
                marginRight: "36px",
            }}
        >
            <Card.Content>
                <Header as="h5">{label}</Header>
                <Header as="h1" color="blue" style={{ marginTop: "17px" }}>
                    {content}
                </Header>
            </Card.Content>
        </Card>
    );
}
