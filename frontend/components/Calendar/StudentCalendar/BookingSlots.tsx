import React, { useMemo } from "react";
import {
    Button,
    Header,
    Icon,
    Label,
    Segment,
    Loader,
} from "semantic-ui-react";
import moment from "moment";

interface BookingSlotsProps {
    occurrence: {
        title: string;
        description: string;
        location: string;
        course_id: number;
        start: Date;
        end: Date;
        interval: number;
    };
    onSlotSelect: (slot: { start: Date; end: Date }) => void;
    isLoading?: boolean;
    error?: string;
}

export const BookingSlots: React.FC<BookingSlotsProps> = ({
    occurrence,
    onSlotSelect,
    isLoading = false,
    error,
}) => {
    const slots = useMemo(() => {
        console.log("Generating slots with occurrence:", occurrence);
        if (!occurrence.interval) {
            console.log("No interval provided");
            return [];
        }

        const startTime = moment(occurrence.start);
        const endTime = moment(occurrence.end);
        const intervalMinutes = occurrence.interval;
        const durationMinutes = endTime.diff(startTime, "minutes");
        const numSlots = Math.floor(durationMinutes / intervalMinutes);

        console.log("Slot generation details:", {
            startTime: startTime.format(),
            endTime: endTime.format(),
            intervalMinutes,
            durationMinutes,
            numSlots,
        });

        return Array.from({ length: numSlots }, (_, i) => {
            const slotStart = moment(occurrence.start).add(
                i * intervalMinutes,
                "minutes"
            );
            const slotEnd = moment(slotStart).add(intervalMinutes, "minutes");
            // Randomly mark about 30% of slots as booked
            const isBooked = Math.random() < 0.3;
            return {
                start: slotStart.toDate(),
                end: slotEnd.toDate(),
                isBooked,
            };
        });
    }, [occurrence]);

    console.log("Generated slots:", slots);

    return (
        <div
            style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    flex: 1,
                    overflowY: "scroll",
                    paddingRight: "8px",
                    marginBottom: "16px",
                    maxHeight: "500px",
                }}
            >
                <Segment style={{ padding: "16px" }}>
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                display: "block",
                                color: "#666",
                                marginBottom: "8px",
                                fontWeight: "500",
                            }}
                        >
                            Available Time Slots
                        </label>

                        {isLoading ? (
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    padding: "20px",
                                }}
                            >
                                <Loader active inline="centered">
                                    Loading available slots...
                                </Loader>
                            </div>
                        ) : error ? (
                            <div
                                style={{
                                    color: "#db2828",
                                    padding: "12px",
                                    backgroundColor: "#fff6f6",
                                    borderRadius: "8px",
                                    border: "1px solid #db2828",
                                }}
                            >
                                <Icon name="warning circle" />
                                {error}
                            </div>
                        ) : slots.length === 0 ? (
                            <div
                                style={{
                                    color: "#666",
                                    padding: "12px",
                                    backgroundColor: "#f8f9fa",
                                    borderRadius: "8px",
                                    border: "1px solid #e9ecef",
                                    textAlign: "center",
                                }}
                            >
                                No available slots for this time period
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: "grid",
                                    gap: "8px",
                                }}
                            >
                                {slots.map((slot, index) => (
                                    <Button
                                        key={index}
                                        fluid
                                        onClick={() =>
                                            !slot.isBooked && onSlotSelect(slot)
                                        }
                                        disabled={slot.isBooked}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "12px 16px",
                                            borderRadius: "8px",
                                            backgroundColor: slot.isBooked
                                                ? "#f8f9fa"
                                                : "#f8f9fa",
                                            border: slot.isBooked
                                                ? "1px solid #e9ecef"
                                                : "1px solid #e9ecef",
                                            transition: "all 0.2s ease",
                                            opacity: slot.isBooked ? 0.6 : 1,
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!slot.isBooked) {
                                                e.currentTarget.style.backgroundColor =
                                                    "#e9ecef";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!slot.isBooked) {
                                                e.currentTarget.style.backgroundColor =
                                                    "#f8f9fa";
                                            }
                                        }}
                                    >
                                        <span style={{ fontSize: "1em" }}>
                                            {moment(slot.start).format(
                                                "h:mm A"
                                            )}{" "}
                                            -{" "}
                                            {moment(slot.end).format("h:mm A")}
                                            {slot.isBooked && (
                                                <Label
                                                    color="red"
                                                    size="tiny"
                                                    style={{
                                                        marginLeft: "8px",
                                                    }}
                                                >
                                                    Booked
                                                </Label>
                                            )}
                                        </span>
                                        {!slot.isBooked && (
                                            <Icon name="arrow right" />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </Segment>
            </div>
        </div>
    );
};
