import React, { useMemo, useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { Header, Label, Loader, Dimmer } from "semantic-ui-react";
import "react-big-calendar/lib/css/react-big-calendar.css";

interface BookableVisualizerProps {
    startDate: Date;
    endDate: Date;
    interval: number; // Represents number of 15-minute increments per slot
    isBookable: boolean;
    title: string;
}

interface TimeSlot {
    title: string;
    start: Date;
    end: Date;
    resourceId: number;
    isEvent?: boolean;
}

const localizer = momentLocalizer(moment);

function BookableVisualizer({
    startDate,
    endDate,
    interval,
    isBookable,
    title,
}: BookableVisualizerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { slots, defaultDate } = useMemo(() => {
        try {
            const events: TimeSlot[] = [
                {
                    title: title || "Event",
                    start: new Date(startDate),
                    end: new Date(endDate),
                    resourceId: -1,
                    isEvent: true,
                },
            ];

            if (isBookable && interval > 0 && startDate < endDate) {
                // Convert interval to minutes
                const intervalMinutes = interval * 15;

                // Calculate total duration in minutes
                const durationMinutes =
                    (endDate.getTime() - startDate.getTime()) / (1000 * 60);

                // Calculate number of slots that can fit into the time range
                const slotCount = Math.floor(durationMinutes / intervalMinutes);

                // Generate time slots
                for (let i = 0; i < slotCount; i++) {
                    const slotStart = new Date(
                        startDate.getTime() + i * intervalMinutes * 60 * 1000
                    );
                    const slotEnd = new Date(
                        startDate.getTime() +
                            (i + 1) * intervalMinutes * 60 * 1000
                    );
                    events.push({
                        title: `Slot ${i + 1} (${intervalMinutes} min)`,
                        start: slotStart,
                        end: slotEnd,
                        resourceId: i,
                    });
                }
            }

            return {
                slots: events,
                defaultDate: new Date(startDate),
            };
        } catch (err) {
            setError("Error generating calendar events");
            return {
                slots: [],
                defaultDate: new Date(startDate),
            };
        }
    }, [startDate, endDate, interval, isBookable, title]);

    useEffect(() => {
        // setIsLoading(true);
        // const timer = setTimeout(() => setIsLoading(false), 0);
        // return () => clearTimeout(timer);
    }, [startDate, endDate, interval, isBookable, title]);

    // Calculate scroll time to be 30 minutes before the first slot
    const scrollToTime = new Date(startDate.getTime() - 30 * 60 * 1000);

    if (error) {
        return <div style={{ margin: "20px", color: "red" }}>{error}</div>;
    }

    return (
        <div style={{ margin: "20px" }}>
            <div style={{ marginBottom: "20px" }}>
                <Header as="h4" style={{ marginBottom: "8px" }}>
                    Event Preview
                    {isBookable && (
                        <Label style={{ marginLeft: "10px" }}>
                            {slots.length - 1} slots of {interval * 15} minutes
                            each
                        </Label>
                    )}
                </Header>
                <div style={{ color: "#666", fontSize: "0.9em" }}>
                    {moment(startDate).format("h:mm A")} -{" "}
                    {moment(endDate).format("h:mm A")} on{" "}
                    {moment(startDate).format("dddd, MMMM D, YYYY")}
                </div>
            </div>
            <div style={{ height: "450px", position: "relative" }}>
                {isLoading ? (
                    <Dimmer active inverted>
                        <Loader size="large">Loading</Loader>
                    </Dimmer>
                ) : (
                    <Calendar
                        key={`${startDate.getTime()}-${endDate.getTime()}-${interval}-${isBookable}`}
                        localizer={localizer}
                        events={slots}
                        defaultDate={defaultDate}
                        defaultView="day"
                        views={["day"]}
                        step={15}
                        timeslots={2}
                        showMultiDayTimes={false}
                        toolbar={false}
                        scrollToTime={scrollToTime}
                        eventPropGetter={(event) => ({
                            style: {
                                backgroundColor: event.isEvent
                                    ? "#21ba45"
                                    : "#2185d0",
                                color: "white",
                                borderRadius: "2px",
                                border: "1px none solid",
                                opacity: event.isEvent ? 0.7 : 1,
                            },
                        })}
                        formats={{
                            eventTimeRangeFormat: () => "", // Hide the default time range in events
                        }}
                        slotPropGetter={() => ({
                            style: {
                                margin: 0,
                                padding: "2px 0",
                                borderBottom: "1px solid #f0f0f0",
                            },
                        })}
                    />
                )}
            </div>
        </div>
    );
}

export default BookableVisualizer;
