import { Card, Dropdown, Header, Segment } from "semantic-ui-react";
import React, { useState } from "react";
import AnalyticsCard from "./AnalyticsCard";
import { useStatistic } from "../../../../hooks/data-fetching/analytics";
import { Metric } from "../../../../types";
import { logException } from "../../../../utils/sentry";

interface SummaryCardsProps {
    courseId: number;
    queueId: number;
}

export default function SummaryCards({ courseId, queueId }: SummaryCardsProps) {
    const [timeRange, setTimeRange] = useState(7);
    const timeRangeOptions = [7, 30, 90].map((range) => {
        return {
            key: range,
            value: range,
            text: `Last ${range} days`,
        };
    });

    const {
        data: numAnsweredData,
        isValidating: numAnsweredValidating,
    } = useStatistic(courseId, queueId, Metric.NUM_ANSWERED, timeRange);

    const { data: avgWaitData, isValidating: avgWaitValidating } = useStatistic(
        courseId,
        queueId,
        Metric.AVG_WAIT,
        timeRange
    );

    const {
        data: studentsHelpedData,
        isValidating: studentsHelpedValidating,
    } = useStatistic(courseId, queueId, Metric.STUDENTS_HELPED, timeRange);

    const {
        data: avgTimeHelpingData,
        isValidating: avgTimeHelpingValidating,
    } = useStatistic(courseId, queueId, Metric.AVG_TIME_HELPING, timeRange);

    const sum = (data) => {
        return data.reduce((prev, cur) => prev + parseInt(cur.value, 10), 0);
    };

    const averageWeighted = (data, weights) => {
        let timeHelping = 0;
        let numHelped = 0;

        for (const dataItem of data) {
            const weightItem = weights.find(
                (ele) => dataItem.date === ele.date
            );
            if (weightItem) {
                timeHelping +=
                    parseInt(dataItem.value, 10) *
                    parseInt(weightItem.value, 10);
                numHelped += parseInt(weightItem.value, 10);
            } else {
                logException(
                    Error("Missing weight entry for data item when averaging"),
                    dataItem.date
                );
            }
        }
        return numHelped ? timeHelping / numHelped : undefined;
    };

    const avgWaitWeighted = averageWeighted(avgWaitData, numAnsweredData);
    const avgTimeHelpingWeighted = averageWeighted(
        avgTimeHelpingData,
        studentsHelpedData
    );

    return (
        <Segment padded>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Header as="h3">Summary Statistics</Header>
                <Dropdown
                    inline
                    options={timeRangeOptions}
                    defaultValue={timeRange}
                    onChange={(e, { value }) => {
                        setTimeRange(value as number);
                    }}
                />
            </div>
            <Card.Group>
                <AnalyticsCard
                    label="Questions Answered"
                    content={`${sum(numAnsweredData)} questions`}
                    isValidating={numAnsweredValidating}
                />
                {avgWaitWeighted && (
                    <AnalyticsCard
                        label="Average Wait Time"
                        content={`${Math.round(avgWaitWeighted / 60)} minutes`}
                        isValidating={avgWaitValidating}
                    />
                )}
                <AnalyticsCard
                    label="Students Helped"
                    content={`${sum(studentsHelpedData)} students`}
                    isValidating={studentsHelpedValidating}
                />
                {avgTimeHelpingWeighted && (
                    <AnalyticsCard
                        label="Average Time per Student"
                        content={`${Math.round(
                            avgTimeHelpingWeighted / 60
                        )} minutes`}
                        isValidating={avgTimeHelpingValidating}
                    />
                )}
            </Card.Group>
        </Segment>
    );
}
