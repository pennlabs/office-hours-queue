import { Grid, Header, Segment, SemanticCOLORS } from "semantic-ui-react";
import { useState } from "react";
import { Course, Occurrence } from "../../../types";

interface EventCardProps {
    occurrence: Occurrence;
    course: Course;
    color: SemanticCOLORS;
    onClick: () => void;
}

const EventCard = (props: EventCardProps) => {
    const { occurrence, course, color, onClick } = props;

    const startDate = new Date(occurrence.start);
    const endDate = new Date(occurrence.end);

    const [hover, setHover] = useState(false);

    const formatDate = (date: Date) =>
        date.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });

    return (
        <Segment
            color={color as SemanticCOLORS}
            style={{
                cursor: "pointer",
                title: occurrence.description,
            }}
            raised={hover}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}
        >
            {/* TODO: get rid of hardcoded width */}
            <Grid style={{ width: "240px" }}>
                <Grid.Column width={10}>
                    <Header
                        as="h4"
                        style={{
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                        }}
                    >
                        {`${course.department} ${course.courseCode}`}
                        <Header.Subheader
                            style={{
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                            }}
                        >
                            {occurrence.title}
                        </Header.Subheader>
                    </Header>
                </Grid.Column>
                <Grid.Column width={6} textAlign="right">
                    <Header as="h5">
                        {formatDate(startDate)}
                        <br />
                        {formatDate(endDate)}
                    </Header>
                </Grid.Column>
            </Grid>
        </Segment>
    );
};

export default EventCard;
