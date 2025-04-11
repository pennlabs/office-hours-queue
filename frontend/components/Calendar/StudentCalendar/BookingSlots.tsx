import {
    Button,
    Grid,
    Header,
    Segment,
    Label,
    Icon,
    Loader,
} from "semantic-ui-react";
import React, { useMemo } from "react";
import { Occurrence } from "../../../types";
import moment from "moment";

interface Slot {
    start: Date;
    end: Date;
    isBooked: boolean;
    isPast: boolean;
}

interface BookingSlotsProps {
    occurrence: Occurrence;
    onSlotSelect: (start: Date, end: Date) => void;
    isLoading?: boolean;
    error?: string;
}

export const BookingSlots: React.FC<BookingSlotsProps> = ({
    occurrence,
    onSlotSelect,
    isLoading = false,
    error,
}) => {
    const { slots, isOpen } = useMemo(() => {
        const now = moment();
        const startTime = moment(occurrence.start);
        const endTime = moment(occurrence.end);

        // Check if current time is within the occurrence's time range
        const isOpen = true;

        // Use the interval from the occurrence or default to 30 minutes
        const interval = occurrence.interval || 30;
        const duration = endTime.diff(startTime, "minutes");
        const numSlots = Math.floor(duration / interval);

        const slots: Slot[] = Array.from({ length: numSlots }, (_, i) => {
            const slotStart = moment(occurrence.start).add(
                i * interval,
                "minutes"
            );
            const slotEnd = moment(slotStart).add(interval, "minutes");
            return {
                start: slotStart.toDate(),
                end: slotEnd.toDate(),
                isBooked: false, // TODO: Implement actual booking status check
                isPast: now.isAfter(slotEnd),
            };
        });

        return { slots, isOpen };
    }, [occurrence]);

    if (isLoading) {
        return (
            <Segment style={{ marginTop: "20px", padding: "20px" }}>
                <Loader active inline="centered">
                    Loading available slots...
                </Loader>
            </Segment>
        );
    }

    if (error) {
        return (
            <Segment style={{ marginTop: "20px", padding: "20px" }} color="red">
                <Header as="h4" color="red">
                    <Icon name="warning sign" />
                    Error Loading Slots
                </Header>
                <p>{error}</p>
            </Segment>
        );
    }

    return (
        <Segment style={{ marginTop: "20px", padding: "20px" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                }}
            >
                <Header as="h3" style={{ margin: 0, color: "#1b1c1d" }}>
                    Available Time Slots
                </Header>
                <Label
                    color={isOpen ? "green" : "red"}
                    size="large"
                    style={{
                        padding: "8px 12px",
                        borderRadius: "4px",
                    }}
                >
                    <Icon name={isOpen ? "check circle" : "times circle"} />
                    {isOpen ? "Open Now" : "Closed"}
                </Label>
            </div>
            <div
                style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    paddingRight: "8px", // Add some padding for the scrollbar
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                    }}
                >
                    {slots.map((slot, index) => (
                        <Label
                            key={index}
                            as="a"
                            onClick={() =>
                                !slot.isBooked &&
                                !slot.isPast &&
                                isOpen &&
                                onSlotSelect(slot.start, slot.end)
                            }
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "12px",
                                borderRadius: "4px",
                                border: "1px solid #ddd",
                                backgroundColor: "white",
                                cursor:
                                    slot.isBooked || slot.isPast || !isOpen
                                        ? "not-allowed"
                                        : "pointer",
                                opacity:
                                    slot.isBooked || slot.isPast || !isOpen
                                        ? 0.7
                                        : 1,
                                transition: "all 0.2s ease",
                                ":hover": {
                                    backgroundColor: "#f0f0f0",
                                },
                            }}
                            onMouseEnter={(e) => {
                                // if (!slot.isBooked && !slot.isPast && isOpen) {
                                //     e.currentTarget.style.transform =
                                //         "translateX(2px)";
                                //     e.currentTarget.style.boxShadow =
                                //         "0 2px 4px rgba(0,0,0,0.1)";
                                // }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "none";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <span style={{ fontWeight: "bold" }}>
                                    {moment(slot.start).format("h:mm A")} -{" "}
                                    {moment(slot.end).format("h:mm A")}
                                </span>
                                {slot.isBooked && (
                                    <Label color="grey" size="tiny">
                                        Booked
                                    </Label>
                                )}
                                {slot.isPast && (
                                    <Label color="grey" size="tiny">
                                        Past
                                    </Label>
                                )}
                            </div>
                            {!slot.isBooked && !slot.isPast && isOpen && (
                                <Icon
                                    name="chevron right"
                                    style={{ color: "#666" }}
                                />
                            )}
                        </Label>
                    ))}
                </div>
            </div>
        </Segment>
    );
};
