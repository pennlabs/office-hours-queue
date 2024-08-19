import { Grid, Header, Loader, Segment } from "semantic-ui-react";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Occurrence, UserMembership } from "../../../types";
import {
    apiOccurrenceToOccurrence,
    useOccurrences,
} from "../../../hooks/data-fetching/calendar";
import {
    eventColors,
    filterSortMemberships,
    getMembershipIndex,
    readSelectedCourses,
} from "../calendarUtils";
import EventCard from "./EventCard";
import { EventInfoModal } from "../CalendarCommon";

interface EventSidebarProps {
    memberships: UserMembership[];
}

const EventSidebar = (props: EventSidebarProps) => {
    const memberships = filterSortMemberships(props.memberships);

    const { data, setFilter } = useOccurrences(
        memberships.map((ele) => ele.course.id),
        new Date(),
        moment().endOf("day").toDate()
    );
    const occurrences = (data || []).map(apiOccurrenceToOccurrence);

    const [selectedOccurrence, setSelectedOccurrence] =
        useState<Occurrence | null>(null);
    const selectedMembership = memberships.find(
        (m) => m.course.id === selectedOccurrence?.event.course_id
    );

    const startOfHour = moment().startOf("hour").toISOString();
    useEffect(() => {
        setFilter({
            start: new Date(),
            end: moment().endOf("day").toDate(),
        });
    }, [startOfHour]);

    // Course filter.
    const [selectedCourses, setSelectedCourses] = useState(
        memberships.map((m) => m.course.id)
    );
    useEffect(() => {
        const parsed = readSelectedCourses();
        if (parsed) {
            setSelectedCourses(parsed);
        }
    }, []);

    const eventCards = occurrences
        .filter((o) => !o.cancelled)
        .sort((a, b) => a.start.getTime() - b.start.getTime())
        .map((o) => {
            const courseIndex = getMembershipIndex(
                memberships,
                o.event.course_id
            );
            if (courseIndex === -1) return undefined;
            if (!selectedCourses.includes(o.event.course_id)) return undefined;

            return (
                <EventCard
                    occurrence={o}
                    course={memberships[courseIndex].course}
                    color={eventColors[courseIndex % eventColors.length]}
                    onClick={() => setSelectedOccurrence(o)}
                />
            );
        })
        .filter((o) => o);

    const sidebarContent =
        eventCards.length > 0 ? (
            eventCards
        ) : (
            <div>You have no events today!</div>
        );

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
                            sidebarContent
                        )}
                    </Grid.Row>
                </Grid>
            </Segment>

            <EventInfoModal
                occurrence={selectedOccurrence}
                membership={selectedMembership}
                setOccurrence={setSelectedOccurrence}
            />
        </Segment>
    );
};

export default EventSidebar;
