import {
    Grid,
    Header,
    Loader,
    Segment,
    SemanticCOLORS,
} from "semantic-ui-react";
import moment from "moment";
import { useEffect } from "react";
import { UserMembership, Course, Occurrence } from "../../../types";
import {
    apiOccurrenceToOccurrence,
    useOccurrences,
} from "../../../hooks/data-fetching/calendar";

interface EventCardProps {
    occurrence: Occurrence;
    course: Course;
    color: SemanticCOLORS;
}

interface EventSidebarProps {
    memberships: UserMembership[];
}

const EventCard = (props: EventCardProps) => {
    const { occurrence, course, color } = props;

    const startDate = new Date(occurrence.start);
    const endDate = new Date(occurrence.end);

    const formatDate = (date: Date) =>
        date.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });

    // @ts-ignore
    return (
        <Segment attached="top" color={color as SemanticCOLORS}>
            <Grid>
                <Grid.Column width={8}>
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
                <Grid.Column width={8} textAlign="right">
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

const EventSidebar = (props: EventSidebarProps) => {
    const { memberships } = props;

    const { data, setFilter } = useOccurrences(
        memberships.map((ele) => ele.course.id),
        new Date(),
        moment().endOf("day").toDate()
    );
    const occurrences = (data || []).map(apiOccurrenceToOccurrence);

    useEffect(() => {
        setFilter({
            start: new Date(),
            end: moment().endOf("day").toDate(),
        });
    }, [moment().startOf("hour").toISOString()]);

    const getMembershipIndex = (courseId) =>
        memberships.findIndex(
            (membership) => membership.course.id === courseId
        );

    const colors: SemanticCOLORS[] = [
        "red",
        "olive",
        "blue",
        "pink",
        "orange",
        "yellow",
        "violet",
        "brown",
        "yellow",
        "teal",
        "purple",
        "grey",
    ];

    return (
        <Segment basic style={{ width: "280px" }}>
            <Segment basic>
                <Grid padded stackable container>
                    <Grid.Row>
                        <Header as="h2">Today&apos;s Events</Header>
                    </Grid.Row>
                    <Grid.Row>
                        {data === undefined ? (
                            <>
                                <Segment basic />
                                <Loader active />
                            </>
                        ) : (
                            occurrences
                                .sort(
                                    (a, b) =>
                                        a.start.getTime() - b.start.getTime()
                                )
                                .map((o) => {
                                    const courseIndex = getMembershipIndex(
                                        o.event.course_id
                                    );
                                    if (
                                        courseIndex === -1 ||
                                        memberships[courseIndex].course.archived
                                    )
                                        return undefined;

                                    return (
                                        <EventCard
                                            occurrence={o}
                                            course={
                                                memberships[courseIndex].course
                                            }
                                            color={colors[courseIndex]}
                                        />
                                    );
                                })
                        )}
                    </Grid.Row>
                </Grid>
            </Segment>
        </Segment>
    );
};

export default EventSidebar;
