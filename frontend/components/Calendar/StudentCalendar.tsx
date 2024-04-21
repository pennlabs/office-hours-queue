import { Loader } from "semantic-ui-react";
import React, { useContext } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import {
    apiOccurrenceToOccurrence,
    useOccurrences,
} from "../../hooks/data-fetching/calendar";
import { ApiOccurrence, Occurrence } from "../../types";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {AuthUserContext} from "../../context/auth";
import {useMemberships} from "../../hooks/data-fetching/dashboard";
import {Kind, UserMembership} from "../../types";
import {filterSortMemberships} from "./calendarUtils";

const localizer = momentLocalizer(moment);

export default function InstructorCalendar(props) {
    const { user: initialUser } = useContext(AuthUserContext);
    if (initialUser === undefined) {
        throw new Error("Must be logged-in");
    }

    const membershipsSWR = useMemberships(initialUser);
    const memberships = filterSortMemberships(membershipsSWR.memberships);

    const getMemberships = (isStudent: boolean): UserMembership[] => {
        return memberships.filter((membership) => {
            return (
                (isStudent && membership.kind === Kind.STUDENT) ||
                (!isStudent && membership.kind !== Kind.STUDENT)
            );
        });
    };

    // Load whole month at a time to reduce revalidation and enable more optimistic updates.
    const { data, mutate, setFilter } = useOccurrences(
        memberships.map((m) => m.course.id),
        moment().startOf("month").weekday(0).toDate(),
        moment().endOf("month").weekday(7).toDate()
    );
    const occurrences: Occurrence[] = (data || []).map(apiOccurrenceToOccurrence);

    return (
        <>
            <Loader size="massive" active={data === undefined} />
            <Calendar
                scrollToTime={new Date(0, 0, 0, 9, 0, 0)}
                localizer={localizer}
                defaultView={Views.WEEK}
                views={["month", "week", "day"]}
                showMultiDayTimes={true}
                events={occurrences.filter((o: Occurrence) => !o.cancelled)}
                eventPropGetter={(resource: Occurrence) => ({
                    style: {
                        backgroundColor: "#ED9393",
                        brightness: "200%",
                        color: "white",
                        borderRadius: "2",
                        border: "none",
                    },
                })}
                tooltipAccessor="description"
                style={{ height: 600 }}
                selectable={true}
                onSelectEvent={(occurrence: Occurrence) =>
                occurrence.cancelled
                    ? setEditCancelledOccurrence(occurrence)
                    : setEditOccurrence(occurrence)
            }
                onRangeChange={(range: Date[] | { start: Date; end: Date }) => {
                    if (Array.isArray(range)) {
                        setFilter({
                            start: moment(range[0])
                                .startOf("month")
                                .weekday(0)
                                .toDate(),
                            end: moment(range[0])
                                .endOf("month")
                                .weekday(7)
                                .toDate(),
                        });
                    } else {
                        setFilter({
                            start: range.start,
                            end: range.end,
                        });
                    }
                }}
            />
    </>
);
}
