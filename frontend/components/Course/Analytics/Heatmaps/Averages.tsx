import { Tab, Segment, Header } from "semantic-ui-react";
import React from "react";
import { useHeatmapData } from "../../../../hooks/data-fetching/analytics";
import { Metric } from "../../../../types";
import Heatmap from "./Heatmap";

interface AveragesProps {
    courseId: number;
    queueId: number;
}

export default function Averages({ courseId, queueId }: AveragesProps) {
    const data = useHeatmapData(courseId, queueId, Metric.HEATMAP_QUESTIONS);

    return (
        <>
            <Segment basic>
                <Header as="h3">Averages</Header>
                <Tab
                    menu={{ secondary: true, pointing: true }}
                    panes={[
                        {
                            menuItem: "Questions per Instructor",
                            render: () => {
                                return data ? (
                                    <Heatmap
                                        metricName="Questions per Instructor"
                                        series={data}
                                        chartTitle="Average Questions per Instructor by Hour and Weekday"
                                    />
                                ) : (
                                    <div>Loading...</div>
                                );
                            },
                        },
                        {
                            menuItem: "Wait Times",
                            render: () => <div>queuehuehue</div>,
                        },
                    ]}
                />
            </Segment>
        </>
    );
}
