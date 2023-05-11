import Link from "next/link";
import { useState } from "react";
import { Segment, Grid, Dropdown } from "semantic-ui-react";
import { Course, Queue } from "../../../types";
import Averages from "./Heatmaps/Averages";
import SummaryCards from "./Cards/SummaryCards";

interface AnalyticsProps {
    course: Course;
    queues: Queue[];
}

const Analytics = ({ course, queues }: AnalyticsProps) => {
    const [queueId, setQueueId] = useState<number | undefined>(
        queues.length !== 0 ? queues[0].id : undefined
    );

    const queueOptions = queues.map((queue) => {
        return {
            key: queue.id,
            value: queue.id,
            text: queue.name,
        };
    });

    return (
        <>
            <Grid.Row>
                {queueId ? (
                    <>
                        <Dropdown
                            as="h3"
                            inline
                            options={queueOptions}
                            defaultValue={queueId}
                            onChange={(e, { value }) => {
                                setQueueId(value as number);
                            }}
                        />
                        <SummaryCards courseId={course.id} queueId={queueId} />
                        <Averages courseId={course.id} queueId={queueId} />
                    </>
                ) : (
                    <Segment basic>
                        You have no queues. Create a queue on the{" "}
                        <Link href={`/courses/${course.id}`}>queue page</Link>{" "}
                        to see analytics.
                    </Segment>
                )}
            </Grid.Row>
        </>
    );
};

export default Analytics;
