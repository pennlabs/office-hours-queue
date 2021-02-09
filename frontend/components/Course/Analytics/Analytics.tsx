import Link from "next/link";
import React, { useState } from "react";
import { Segment, Header, Grid, Message, Dropdown } from "semantic-ui-react";
import { Course, Queue } from "../../../types";
import Cards from "./Cards/Cards";
// import MyPieChart from "./MyPieChart";
import Averages from "./Heatmaps/Averages";

interface AnalyticsProps {
    course: Course;
    queues: Queue[];
}

const Analytics = ({ course, queues }: AnalyticsProps) => {
    // const data = {};
    // const [pieChartData, setPieChartData] = useState(null);
    // const [lineChartData, setLineChartData] = useState(null);

    // const getRandomColor = () => {
    //     const letters = "0123456789ABCDEF";
    //     let color = "#";
    //     for (let i = 0; i < 6; i+=1) {
    //         color += letters[Math.floor(Math.random() * 16)];
    //     }
    //     return color;
    // };

    // const getPieChartData = (node) => {
    //     const counts = {};
    //     let noTagCount = 0;

    //     node.questions.edges.forEach((question) => {
    //         if (question.node.tags.length === 0) noTagCount += 1;
    //         question.node.tags.forEach((tag) => {
    //             counts[tag] = counts[tag] ? counts[tag] + 1 : 1;
    //         });
    //     });

    //     const labels = Object.keys(counts).sort();
    //     const datapoints = labels.map((label) => counts[label]);

    //     if (noTagCount > 0) {
    //         labels.push("N/A");
    //         datapoints.push(noTagCount);
    //     }

    //     return {
    //         data: {
    //             labels,
    //             datasets: [
    //                 {
    //                     data: datapoints,
    //                     backgroundColor: [...Array(datapoints.length)].map(
    //                         (item) => {
    //                             return getRandomColor();
    //                         }
    //                     ),
    //                 },
    //             ],
    //         },
    //         type: "pie",
    //         options: {
    //             title: {
    //                 display: true,
    //                 text: `Tag Categories: ${node.name}`,
    //             },
    //         },
    //     };
    // };

    // const lineChartHelper = (node) => {
    //     const counts = {};
    //     node.questions.edges.forEach((question) => {
    //         const dateAsked = new Date(question.node.timeAsked);
    //         counts[dateAsked.toDateString()] = counts[dateAsked.toDateString()]
    //             ? counts[dateAsked.toDateString()] + 1
    //             : 1;
    //     });

    //     return counts;
    // };

    // const getLineChartData = (edges) => {
    //     const countMaps = edges
    //         .filter((item) => !item.node.archived)
    //         .map((item) => lineChartHelper(item.node));
    //     const allCounts = {};

    //     countMaps.forEach((map) => {
    //         Object.keys(map).forEach((key) => (allCounts[key] = map[key]));
    //     });

    //     const stringLabels = Object.keys(allCounts).sort();
    //     const dateLabels = stringLabels.map((label) => new Date(label));
    //     const datasets = edges
    //         .filter((item) => !item.node.archived)
    //         .map((item, i) => {
    //             const color = getRandomColor();
    //             return {
    //                 fill: false,
    //                 label: item.node.name,
    //                 data: stringLabels.map((label) => {
    //                     return countMaps[i][label] ? countMaps[i][label] : 0;
    //                 }),
    //                 borderColor: color,
    //                 backgroundColor: color,
    //                 lineTension: 0,
    //             };
    //         });

    //     return {
    //         data: {
    //             labels: dateLabels,
    //             datasets,
    //         },
    //         type: "scatter",
    //         options: {
    //             fill: false,
    //             responsive: true,
    //             scales: {
    //                 xAxes: [
    //                     {
    //                         type: "time",
    //                         time: {
    //                             displayFormats: {
    //                                 hour: "MMM D hA",
    //                             },
    //                         },
    //                         scaleLabel: {
    //                             display: true,
    //                             labelString: "Date",
    //                         },
    //                     },
    //                 ],
    //                 yAxes: [
    //                     {
    //                         ticks: {
    //                             beginAtZero: true,
    //                         },
    //                         display: true,
    //                         scaleLabel: {
    //                             display: true,
    //                             labelString: "Number of Students",
    //                         },
    //                     },
    //                 ],
    //             },
    //         },
    //     };
    // };

    // if (data && data.course) {
    //     if (!pieChartData) {
    //         setPieChartData(
    //             data.course.queues.edges
    //                 .filter((item) => !item.node.archived)
    //                 .map((item) => {
    //                     return getPieChartData(item.node);
    //                 })
    //         );
    //     }

    //     if (!lineChartData) {
    //         setLineChartData(getLineChartData(data.course.queues.edges));
    //     }
    // }

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
        <Grid.Row>
            {queueId ? (
                <>
                    <Segment basic>
                        <span>
                            Showing statistics for queue:{" "}
                            <Dropdown
                                inline
                                options={queueOptions}
                                defaultValue={queueId}
                                onChange={(e, { value }) => {
                                    setQueueId(value as number);
                                }}
                            />
                        </span>
                    </Segment>
                    <Segment basic>
                        <Cards />
                    </Segment>
                    <Averages courseId={course.id} queueId={queueId} />
                    {/* <Segment basic>
                        <Header as="h3">Questions by Type</Header>
                        {pieChartData &&
                        pieChartData.map((dataset) => {
                            return <MyPieChart dataset={dataset} />;
                        })}
                    </Segment>
                    <Segment basic>
                        <Header as="h3">Queue Traffic</Header>
                        {lineChartData && <MyPieChart dataset={lineChartData} />}
                    </Segment> */}
                </>
            ) : (
                <Segment basic>
                    You have no queues. Create a queue on the{" "}
                    <Link href={`/courses/${course.id}`}>
                        <a>queue page</a>
                    </Link>{" "}
                    to see analytics.
                </Segment>
            )}
        </Grid.Row>
    );
};

export default Analytics;
