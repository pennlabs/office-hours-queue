import { Grid, Header, Segment } from "semantic-ui-react";
import { Kind, UserMembership, Event, Course } from "../../../types";
import { useListEvents } from "../../../hooks/data-fetching/calendar";

interface EventCardProps {
    event: Event;
    course: Course;
}

interface EventSidebarProps {
    memberships: UserMembership[];
}

const EventCard = (props: EventCardProps) => {
    const { event, course } = props;

    const startDate = new Date(event.start);
    // const endDate = new Date(event.end);

    const formatDate = (date: Date) =>
        date.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });

    return (
        <Segment attached="top" color="blue">
            <Grid>
                <Grid.Column width={11}>
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
                            {event.title}
                        </Header.Subheader>
                    </Header>
                </Grid.Column>
                <Grid.Column width={5}>
                    <Header as="h5">{formatDate(startDate)}</Header>
                </Grid.Column>
            </Grid>
        </Segment>
    );
};

const EventSidebar = (props: EventSidebarProps) => {
    const { memberships } = props;

    const { data, isValidating } = useListEvents(
        memberships.map((ele) => ele.course.id)
    );

    const studentEvents = data.filter((event) =>
        memberships.find(
            (membership) =>
                event.course_id === membership.course.id &&
                membership.kind === Kind.STUDENT
        )
    );

    const instructorEvents = data.filter((event) =>
        memberships.find(
            (membership) =>
                event.course_id === membership.course.id &&
                membership.kind !== Kind.STUDENT
        )
    );

    const findCourse = (courseId) =>
        memberships.find((ele) => ele.course.id === courseId)!.course;

    return (
        <Segment basic>
            <Segment basic>
                <Grid padded stackable container>
                    <Grid.Row>
                        <Header as="h2">Student Events</Header>
                        {isValidating
                            ? "Loading..."
                            : studentEvents.map((ele) => (
                                  <EventCard
                                      event={ele}
                                      course={findCourse(ele.course_id)}
                                  />
                              ))}
                    </Grid.Row>
                    <Grid.Row>
                        <Header as="h2">Instructor Events</Header>
                        {isValidating
                            ? "Loading..."
                            : instructorEvents.map((ele) => (
                                  <EventCard
                                      event={ele}
                                      course={findCourse(ele.course_id)}
                                  />
                              ))}
                    </Grid.Row>
                </Grid>
            </Segment>
        </Segment>
    );
};

export default EventSidebar;
