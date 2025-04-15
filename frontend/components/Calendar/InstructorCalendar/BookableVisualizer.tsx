import React, { useMemo, useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { Header, Label, Loader, Dimmer, Icon } from "semantic-ui-react";
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
                    title: title || "Untitled Event",
                    start: new Date(startDate),
                    end: new Date(
                        Math.min(
                            endDate.getTime(),
                            moment(startDate).endOf("day").toDate().getTime()
                        )
                    ),
                    resourceId: -1,
                    isEvent: true,
                },
            ];

            if (isBookable && interval > 0 && startDate < endDate) {
                // Convert interval to minutes
                const intervalMinutes = interval;

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

                    // Only add slot if it doesn't exceed end of day or endDate
                    const endOfDay = moment(slotStart).endOf("day").toDate();
                    const effectiveEnd = new Date(
                        Math.min(endOfDay.getTime(), endDate.getTime())
                    );

                    if (slotStart < effectiveEnd) {
                        events.push({
                            title: `Slot ${i + 1}`,
                            start: slotStart,
                            end: new Date(
                                Math.min(
                                    slotEnd.getTime(),
                                    effectiveEnd.getTime()
                                )
                            ),
                            resourceId: i,
                        });
                    }
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
        <div
            style={{
                margin: "20px",
                background: "white",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    padding: "20px",
                    borderBottom: "1px solid #f0f0f0",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "12px",
                    }}
                >
                    <Header as="h4" style={{ margin: 0 }}>
                        Event Preview
                    </Header>
                    {isBookable && (
                        <Label
                            style={{
                                background: "#e8f5e9",
                                color: "#2e7d32",
                                border: "none",
                                padding: "6px 12px",
                            }}
                        >
                            <Header
                                as="h5"
                                style={{
                                    margin: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >
                                <Icon name="clock outline" size="large" />
                                {slots.length - 1} slots of {interval} minutes
                                each
                            </Header>
                        </Label>
                    )}
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "8px",
                        color: "#666",
                        fontSize: "0.9em",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <Header
                            as="h5"
                            style={{
                                margin: 0,
                                display: "flex",
                                alignItems: "center",
                                fontWeight: "normal",
                            }}
                        >
                            <Icon name="calendar outline" size="large" />
                            <span>
                                {moment(startDate).format("dddd, MMMM D, YYYY")}{" "}
                                {endDate.getDate() != startDate.getDate()
                                    ? "- " +
                                      moment(endDate).format(
                                          "dddd, MMMM D, YYYY"
                                      )
                                    : ""}
                            </span>
                        </Header>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <Header
                            as="h5"
                            style={{
                                margin: 0,
                                display: "flex",
                                alignItems: "center",
                                fontWeight: "normal",
                            }}
                        >
                            <Icon name="clock outline" size="large" />
                            <span>
                                {moment(startDate).format("h:mm A")} -{" "}
                                {moment(endDate).format("h:mm A")}
                            </span>
                        </Header>
                    </div>
                </div>
            </div>
            <div
                style={{
                    height: "450px",
                    position: "relative",
                    padding: "0 20px 20px",
                }}
            >
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
                        timeslots={1}
                        showMultiDayTimes={false}
                        toolbar={false}
                        scrollToTime={scrollToTime}
                        eventPropGetter={(event) =>
                            event.isEvent
                                ? {
                                      style: {
                                          backgroundColor: "#4caf50",
                                          color: "white",
                                          borderRadius: "4px",
                                          border: "none",
                                          boxShadow:
                                              "0 1px 3px rgba(0,0,0,0.1)",
                                          opacity: 0.8,
                                          padding: "6px 6px",
                                          fontSize: "2em",
                                      },
                                  }
                                : {
                                      style: {
                                          backgroundColor: "#f8f9fa",
                                          borderRadius: "4px",
                                          opacity: 1,
                                          border: "1px solid #e9ecef",
                                          borderLeft: "4px solid #ddd",
                                          color: "#495057",
                                          fontSize: "0.8em",
                                          padding: "6px 6px",
                                          display: "flex",
                                          alignItems: "center",
                                          marginBottom: "4px",
                                          boxShadow:
                                              "0 1px 2px rgba(0,0,0,0.05)",
                                          transition: "all 0.2s ease",
                                          "&:hover": {
                                              backgroundColor: "#e9ecef",
                                              transform: "translateY(-1px)",
                                              boxShadow:
                                                  "0 2px 3px rgba(0,0,0,0.1)",
                                          },
                                      },
                                  }
                        }
                        formats={{
                            eventTimeRangeFormat: () => "",
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
