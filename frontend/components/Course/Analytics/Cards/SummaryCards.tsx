import { Card, Dropdown, Header, Segment } from "semantic-ui-react";
import React, { useState } from "react";
import AnalyticsCard from "./AnalyticsCard";
import { useStatistic } from "../../../../hooks/data-fetching/analytics";
import { Metric } from "../../../../types";

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
        const timeHelping: { value: number; date: string }[] = [];
        const numHelped: { value: number; date: string }[] = [];
        for (const dataItem of data) {
            const weightItem = weights.find(
                (ele) => dataItem.date === ele.date
            );
            if (weightItem) {
                timeHelping.push({
                    value: dataItem.value * weightItem.value,
                    date: dataItem.date,
                });
                numHelped.push({
                    value: weightItem.value,
                    date: dataItem.date,
                });
            }
        }
        return sum(timeHelping) / sum(numHelped) || 0;
    };

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
                    content={
                        numAnsweredValidating
                            ? "..."
                            : `${sum(numAnsweredData)} questions`
                    }
                />
                <AnalyticsCard
                    label="Average Wait Time"
                    content={
                        avgWaitValidating
                            ? "..."
                            : `${Math.round(
                                  averageWeighted(
                                      avgWaitData,
                                      numAnsweredData
                                  ) / 60
                              )} minutes`
                    }
                />
                <AnalyticsCard
                    label="Students Helped"
                    content={
                        studentsHelpedValidating
                            ? "..."
                            : `${sum(studentsHelpedData)} students`
                    }
                />
                <AnalyticsCard
                    label="Average Time per Student"
                    content={
                        avgTimeHelpingValidating
                            ? "..."
                            : `${Math.round(
                                  averageWeighted(
                                      avgTimeHelpingData,
                                      studentsHelpedData
                                  ) / 60
                              )} minutes`
                    }
                />
            </Card.Group>
        </Segment>
    );
}
