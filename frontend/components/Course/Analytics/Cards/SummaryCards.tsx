import { Card, Dropdown, Header } from "semantic-ui-react";
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

    const { data: avgWaitData, isValidating: avgWaitValidating } = useStatistic(
        courseId,
        queueId,
        Metric.AVG_WAIT,
        timeRange
    );

    const {
        data: numAnsweredData,
        isValidating: numAnsweredValidating,
    } = useStatistic(courseId, queueId, Metric.NUM_ANSWERED, timeRange);

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

    const average = (data) => {
        return sum(data) / data.length || 0;
    };

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Header as="h3">At a Glance</Header>
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
                    label="Average Wait Time"
                    content={
                        avgWaitValidating
                            ? "..."
                            : `${Math.round(average(avgWaitData))} minutes`
                    }
                />
                <AnalyticsCard
                    label="Questions Answered"
                    content={
                        numAnsweredValidating
                            ? "..."
                            : `${sum(numAnsweredData)} questions`
                    }
                />
                <AnalyticsCard
                    label="Students Helped"
                    content={
                        studentsHelpedValidating
                            ? "..."
                            : `${sum(studentsHelpedData)} questions`
                    }
                />
                <AnalyticsCard
                    label="Average Time per Student"
                    content={
                        avgTimeHelpingValidating
                            ? "..."
                            : `${Math.round(
                                  average(avgTimeHelpingData)
                              )} minutes`
                    }
                />
            </Card.Group>
        </>
    );
}
