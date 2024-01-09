import { Grid, Header, Segment, SemanticCOLORS } from "semantic-ui-react";
import { UserMembership, Event, Course } from "../../../types";
import { useListEvents } from "../../../hooks/data-fetching/calendar";

interface EventCardProps {
    event: Event;
    course: Course;
    color: SemanticCOLORS;
}

interface EventSidebarProps {
    memberships: UserMembership[];
}

const EventCard = (props: EventCardProps) => {
    const { event, course, color } = props;

    const startDate = new Date(event.start);

    const formatDate = (date: Date) =>
        date.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });

    return (
        <Segment attached="top" color={color as SemanticCOLORS}>
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

    const getMembershipIndex = (courseId) =>
        memberships.findIndex(
            (membership) => membership.course.id === courseId
        );

    const events = data.filter(
        (event) => getMembershipIndex(event.course_id) !== -1
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
                        {isValidating
                            ? "Loading..."
                            : events.map((ele) => {
                                  const courseIndex = getMembershipIndex(
                                      ele.course_id
                                  );
                                  if (
                                      courseIndex === -1 ||
                                      memberships[courseIndex].course.archived
                                  )
                                      return undefined;

                                  return (
                                      <EventCard
                                          event={ele}
                                          course={
                                              memberships[courseIndex].course
                                          }
                                          color={colors[courseIndex]}
                                      />
                                  );
                              })}
                    </Grid.Row>
                </Grid>
            </Segment>
        </Segment>
    );
};

export default EventSidebar;
