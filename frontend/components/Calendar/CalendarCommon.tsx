import {
    Icon,
    Modal,
    SemanticICONS,
    Header,
    Segment,
    Label,
    Button,
} from "semantic-ui-react";
import React, { useState } from "react";
import Link from "next/link";
import { Occurrence, UserMembership } from "../../types";
import { dayNames, paramsToDays } from "./calendarUtils";
import { BookingSlots } from "./StudentCalendar/BookingSlots";
import moment from "moment";

const IconTextBlock = (props: {
    iconName: SemanticICONS;
    children: React.JSX.Element;
}) => {
    const { iconName, children } = props;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: "15px",
            }}
        >
            <Icon
                size="large"
                name={iconName}
                style={{
                    marginRight: "15px",
                    color: "#2185d0",
                    flexShrink: 0,
                }}
            />
            <div style={{ flex: 1 }}>{children}</div>
        </div>
    );
};

interface TimeSlot {
    start: Date;
    end: Date;
    isBooked: boolean;
}

export const EventInfoModal = (props: {
    occurrence: Occurrence | null;
    membership: UserMembership | undefined;
    setOccurrence: (occurrence: Occurrence | null) => void;
}) => {
    const { occurrence, membership, setOccurrence } = props;
    const [selectedSlot, setSelectedSlot] = useState<{
        start: Date;
        end: Date;
    } | null>(null);

    const handleSlotSelect = (start: Date, end: Date) => {
        setSelectedSlot({ start, end });
        // TODO: Implement booking logic here
        console.log("Selected slot:", { start, end });
    };

    const isOpen = occurrence
        ? moment().isBetween(moment(occurrence.start), moment(occurrence.end))
        : false;

    return (
        <Modal
            size="small"
            open={occurrence !== null}
            onClose={() => setOccurrence(null)}
            style={{ maxWidth: "600px" }}
        >
            <Modal.Header
                style={{
                    padding: "20px",
                    borderBottom: "1px solid rgba(34,36,38,.15)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <Header as="h2" style={{ margin: 0 }}>
                        {`${membership?.course.department} ${membership?.course.courseCode}`}
                        <Header.Subheader style={{ marginTop: "5px" }}>
                            {occurrence?.title}
                        </Header.Subheader>
                    </Header>
                    <button
                        type="button"
                        style={{
                            position: "absolute",
                            right: "20px",
                            top: "20px",
                            cursor: "pointer",
                            background: "none",
                            border: "none",
                            fontSize: "1.2em",
                            color: "#999",
                        }}
                        onClick={() => setOccurrence(null)}
                    >
                        <i className="close icon" />
                    </button>
                </div>
            </Modal.Header>
            <Modal.Content style={{ padding: "20px" }}>
                <Modal.Description>
                    <Segment
                        style={{
                            padding: "20px",
                            boxShadow: "none",
                            border: "1px solid rgba(34,36,38,.15)",
                        }}
                    >
                        <IconTextBlock iconName="clock outline">
                            <div>
                                <div
                                    style={{
                                        fontSize: "1.1em",
                                        fontWeight: "bold",
                                        marginBottom: "5px",
                                    }}
                                >
                                    {occurrence?.start.toLocaleDateString(
                                        "en-US",
                                        {
                                            weekday: "long",
                                            month: "long",
                                            day: "numeric",
                                        }
                                    )}
                                </div>
                                <div style={{ color: "#666" }}>
                                    {occurrence?.start.toLocaleTimeString(
                                        "en-US",
                                        {
                                            hour: "numeric",
                                            minute: "numeric",
                                        }
                                    )}{" "}
                                    -{" "}
                                    {occurrence?.end.toLocaleTimeString(
                                        "en-US",
                                        {
                                            hour: "numeric",
                                            minute: "numeric",
                                        }
                                    )}
                                </div>
                                {occurrence?.event.rule && (
                                    <div
                                        style={{
                                            marginTop: "5px",
                                            color: "#666",
                                            fontSize: "0.9em",
                                        }}
                                    >
                                        Weekly on{" "}
                                        {paramsToDays(
                                            occurrence.event.rule.params,
                                            0
                                        )
                                            .map((dayNum) => dayNames[dayNum])
                                            .join(", ")}
                                    </div>
                                )}
                            </div>
                        </IconTextBlock>
                        {occurrence?.description && (
                            <IconTextBlock iconName="file text outline">
                                <div
                                    style={{
                                        color: "#666",
                                        lineHeight: "1.5",
                                    }}
                                >
                                    {occurrence.description}
                                </div>
                            </IconTextBlock>
                        )}
                        {occurrence?.location && (
                            <IconTextBlock iconName="map marker alternate">
                                <div
                                    style={{
                                        color: "#666",
                                        fontWeight: "500",
                                    }}
                                >
                                    {occurrence.location}
                                </div>
                            </IconTextBlock>
                        )}
                    </Segment>
                    {occurrence && (
                        <BookingSlots
                            occurrence={occurrence}
                            onSlotSelect={handleSlotSelect}
                        />
                    )}
                </Modal.Description>
            </Modal.Content>
        </Modal>
    );
};

interface Event {
    id: number;
    title: string;
    start: Date;
    end: Date;
    interval?: number;
    // ... other event properties
}

interface CalendarCellProps {
    date: Date;
    events: Occurrence[];
    setOccurrence: (occurrence: Occurrence | null) => void;
}

const renderCell = ({ date, events, setOccurrence }: CalendarCellProps) => {
    const dayEvents = events.filter((event) => {
        const eventDate = new Date(event.start);
        return (
            eventDate.getDate() === date.getDate() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getFullYear() === date.getFullYear()
        );
    });

    const isOpen = (event: Occurrence) => {
        const now = moment();
        return now.isBetween(moment(event.start), moment(event.end));
    };

    return (
        <div
            style={{
                height: "100%",
                padding: "5px",
                overflow: "auto",
            }}
        >
            {dayEvents.map((event, index) => {
                const open = isOpen(event);
                return (
                    <div
                        key={index}
                        style={{
                            marginBottom: "5px",
                            padding: "5px",
                            borderRadius: "4px",
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "5px",
                            }}
                        >
                            <span style={{ fontWeight: "bold" }}>
                                {event.title}
                            </span>
                            <Label
                                size="tiny"
                                color={open ? "green" : "red"}
                                style={{ margin: 0 }}
                            >
                                <Icon
                                    name={
                                        open ? "check circle" : "times circle"
                                    }
                                />
                                {open ? "Open" : "Closed"}
                            </Label>
                        </div>
                        <div style={{ fontSize: "0.9em", color: "#666" }}>
                            {moment(event.start).format("h:mm A")} -{" "}
                            {moment(event.end).format("h:mm A")}
                        </div>
                        {event.interval > 0 && (
                            <div style={{ marginTop: "5px" }}>
                                <Button
                                    size="tiny"
                                    color={open ? "blue" : "grey"}
                                    disabled={!open}
                                    onClick={() => setOccurrence(event)}
                                    style={{ width: "100%" }}
                                >
                                    View Slots
                                </Button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
