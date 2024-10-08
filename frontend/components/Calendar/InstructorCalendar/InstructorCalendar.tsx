import { Loader } from "semantic-ui-react";
import React, { useState, useCallback } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import {
    apiOccurrenceToOccurrence,
    useOccurrences,
} from "../../../hooks/data-fetching/calendar";
import { Occurrence } from "../../../types";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { EditEventModal, NewEventModal } from "./InstructorCalendarModals";
import { eventColorsHex } from "../calendarUtils";

const localizer = momentLocalizer(moment);

type CalendarProps = {
    courseId: number;
};

export default function InstructorCalendar(props: CalendarProps) {
    const { courseId } = props;

    // Load whole month at a time to reduce revalidation and enable more optimistic updates.
    const { data, mutate, setFilter } = useOccurrences(
        [courseId],
        moment().startOf("month").weekday(0).toDate(),
        moment().endOf("month").weekday(7).toDate()
    );
    const occurrences = (data || []).map(apiOccurrenceToOccurrence);

    const [editOccurrence, setEditOccurrence] = useState<Occurrence | null>(
        null
    );

    const [newEvent, setNewEvent] = useState(false);
    const [startField, setStartField] = useState(new Date(1));
    const [endField, setEndField] = useState(new Date(1));

    const handleSelectSlot = useCallback(
        async ({ start, end }: { start: Date; end: Date }) => {
            setNewEvent(true);
            setStartField(start);
            // Dragging to end of day gives invalid 11:59 end time, manually bump to next day.
            if (end.getMinutes() === 59) {
                setEndField(new Date(end.getTime() + 1000));
            } else {
                setEndField(end);
            }
        },
        []
    );

    return (
        <>
            <NewEventModal
                show={newEvent}
                setModalState={setNewEvent}
                mutate={mutate}
                courseId={courseId}
                start={startField}
                end={endField}
            />
            {editOccurrence && (
                <EditEventModal
                    setModalState={setEditOccurrence}
                    mutate={mutate}
                    occurrences={occurrences}
                    occurrence={editOccurrence}
                />
            )}
            <Loader size="massive" active={data === undefined} />
            <Calendar
                scrollToTime={new Date(0, 0, 0, 9, 0, 0)}
                localizer={localizer}
                defaultView={Views.WEEK}
                views={["month", "week", "day"]}
                showMultiDayTimes={true}
                events={occurrences}
                eventPropGetter={(resource: Occurrence) => {
                    if (resource.cancelled) {
                        return {
                            style: {
                                backgroundColor: "#ED9393",
                                brightness: "200%",
                                color: "white",
                                borderRadius: "2",
                                border: "none",
                            },
                        };
                    } else {
                        return {
                            style: {
                                backgroundColor: eventColorsHex.blue,
                                color: "white",
                                borderRadius: "2",
                                border: "none",
                            },
                        };
                    }
                }}
                tooltipAccessor="description"
                style={{ height: 600 }}
                onSelectSlot={handleSelectSlot}
                selectable={true}
                onSelectEvent={(occurrence: Occurrence) =>
                    setEditOccurrence(occurrence)
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
