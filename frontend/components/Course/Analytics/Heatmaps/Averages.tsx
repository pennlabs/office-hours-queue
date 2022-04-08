import { Tab, Segment, Header } from "semantic-ui-react";
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
            <Segment padded>
                <Header as="h3">Semester Averages</Header>
                <Tab
                    menu={{ secondary: true, pointing: true }}
                    panes={[
                        {
                            menuItem: "Questions per Instructor",
                            render: () => {
                                if (questionsData) {
                                    return (
                                        <Heatmap
                                            series={questionsData}
                                            chartTitle="Average Questions per Instructor"
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
                                            series={waitTimesData}
                                            chartTitle="Average Student Wait Times in Minutes"
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
