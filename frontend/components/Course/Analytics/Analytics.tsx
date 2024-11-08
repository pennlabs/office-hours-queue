import Link from "next/link";
import { useState } from "react";
import {
    Segment,
    Grid,
    Dropdown,
    Tab,
    Rating,
    Divider,
} from "semantic-ui-react";
import { Course, Membership, Queue } from "../../../types";
import Averages from "./Heatmaps/Averages";
import SummaryCards from "./Cards/SummaryCards";

interface AnalyticsProps {
    course: Course;
    queues: Queue[];
    leadership: Membership[];
}

const Analytics = ({ course, queues, leadership }: AnalyticsProps) => {
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

    const taOptions = [
        { key: -1, value: -1, text: "Filter by TA" },
        ...leadership.map((leader) => {
            return {
                key: leader.id,
                value: leader.id,
                text: `${leader.user.firstName} ${leader.user.lastName}`,
            };
        }),
    ];

    const [tab, setTab] = useState(0);

    const panes = [
        { menuItem: "Analytics", render: () => <br /> },
        { menuItem: "Student Feedback", render: () => <br /> },
    ];
    return (
        <>
            <Grid.Row>
                <Tab
                    defaultActiveIndex={0}
                    onTabChange={(_, { activeIndex }) =>
                        setTab(activeIndex as number)
                    }
                    panes={panes}
                />
            </Grid.Row>
            <Grid.Row>
                {tab === 0 &&
                    (queueId ? (
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
                            <SummaryCards
                                courseId={course.id}
                                queueId={queueId}
                            />
                            <Averages courseId={course.id} queueId={queueId} />
                        </>
                    ) : (
                        <Segment basic>
                            You have no queues. Create a queue on the{" "}
                            <Link href={`/courses/${course.id}`}>
                                queue page
                            </Link>{" "}
                            to see analytics.
                        </Segment>
                    ))}
                {tab === 1 && (
                    <div>
                        <Dropdown
                            as="h3"
                            inline
                            options={taOptions}
                            defaultValue={-1}
                        />
                        <Segment color="olive">
                            <div>
                                Student <b>Ryan Tanenholz </b>asked &quot;What
                                is the difference between a stack and a
                                queue?&quot;
                            </div>
                            <div>
                                and provided the following feedback to TA{" "}
                                <b>Ben Franklin</b>.
                            </div>
                            <Divider />
                            <div>
                                <b>Rating</b>{" "}
                                <Rating
                                    icon="star"
                                    defaultRating={5}
                                    maxRating={5}
                                    disabled
                                />
                            </div>
                            <div>
                                <b>Comment </b>
                                {/* Default Text */}
                                Ben Franklin was very helpful and explained the
                                concepts clearly. I was struggling with
                                understanding the problem, but Ben Franklin
                                broke it down into manageable parts and guided
                                me through each step. His patience and ability
                                to simplify complex topics made a significant
                                difference in my learning experience. Highly
                                recommend!
                            </div>
                        </Segment>
                    </div>
                )}
            </Grid.Row>
        </>
    );
};

export default Analytics;
