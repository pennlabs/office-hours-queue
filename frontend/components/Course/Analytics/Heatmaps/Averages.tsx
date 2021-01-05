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
    const {
        data: questionsData,
        isValidating: questionsValidating,
    } = useHeatmapData(courseId, queueId, Metric.HEATMAP_QUESTIONS);
    const {
        data: waitTimesData,
        isValidating: waitValidating,
    } = useHeatmapData(courseId, queueId, Metric.HEATMAP_WAIT);

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
                                if (questionsData) {
                                    return (
                                        <Heatmap
                                            metricName="Questions per Instructor"
                                            series={questionsData}
                                            chartTitle="Average Number of Questions per Instructor by Hour and Day of Week"
                                        />
                                    );
                                }
                                if (questionsValidating) {
                                    return <div>Loading...</div>;
                                }
                                return <div>Error loading data</div>;
                            },
                        },
                        {
                            menuItem: "Student Wait Times",
                            render: () => {
                                if (waitTimesData) {
                                    return (
                                        <Heatmap
                                            metricName="Wait Times"
                                            series={waitTimesData}
                                            chartTitle="Average Student Wait Times by Hour and Day of Week"
                                        />
                                    );
                                }
                                if (waitValidating)
                                    return <div>Loading...</div>;
                                return <div>Error loading data</div>;
                            },
                        },
                    ]}
                />
            </Segment>
        </>
    );
}
