import { Button, ButtonProps, Form, Modal } from "semantic-ui-react";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import moment from "moment";
import {
    createEvent,
    dateToEventISO,
    deleteEvent,
    updateEvent,
    updateOccurrence,
    getEventOccurrences,
} from "../../../hooks/data-fetching/calendar";
import {
    ApiEvent,
    ApiOccurrence,
    ApiPartialEvent,
    Occurrence,
} from "../../../types";
import { daysToParams, paramsToDays } from "../calendarUtils";
import BookableVisualizer from "./BookableVisualizer";
import { EventFormFields } from "./EventFormFields";
import { EditEventConfirmationModal } from "./EditEventConfirmationModal";

const utcDayOffset = (date: Date) =>
    date.getUTCDay() < date.getDay() ? 1 : date.getUTCDay() - date.getDay();

interface EditEventProps {
    setModalState: Dispatch<SetStateAction<Occurrence | null>>;
    mutate: mutateResourceListFunction<ApiOccurrence>;
    occurrences: Occurrence[];
    occurrence: Occurrence;
}

export const EditEventModal = (props: EditEventProps) => {
    const { setModalState, mutate, occurrences, occurrence } = props;
    const [title, setTitle] = useState(occurrence.title);
    const [description, setDescription] = useState(occurrence.description);
    const [startDate, setStartDate] = useState(occurrence.start);
    const [endDate, setEndDate] = useState(occurrence.end);
    const [location, setLocation] = useState(occurrence.location);
    const [isRecurring, setIsRecurring] = useState(
        occurrence.event.rule !== null
    );
    const [isBookable, setIsBookable] = useState(occurrence.interval > 0);
    const [interval, setInterval] = useState(
        occurrence.interval > 0 ? occurrence.interval / 15 : 1
    );
    const [recurringDays, setRecurringDays] = useState(
        occurrence.event.rule === null
            ? []
            : paramsToDays(
                  occurrence.event.rule.params,
                  utcDayOffset(occurrence.start)
              )
    );
    const [erpDate, setErpDate] = useState(
        occurrence.event.end_recurring_period ?? occurrence.end
    );

    const [confirmModal, setConfirmModal] = useState<
        React.JSX.Element | undefined
    >(undefined);

    useEffect(() => {
        setTitle(occurrence.title);
        setDescription(occurrence.description);
        setStartDate(occurrence.start);
        setEndDate(occurrence.end);
        setIsRecurring(occurrence.event.rule !== null);
        setRecurringDays(
            occurrence.event.rule === null
                ? []
                : paramsToDays(
                      occurrence.event.rule.params,
                      utcDayOffset(occurrence.start)
                  )
        );
        setIsBookable(occurrence.interval > 0);
        setInterval(occurrence.interval > 0 ? occurrence.interval / 15 : 1);
        setErpDate(occurrence.event.end_recurring_period ?? occurrence.end);
    }, [occurrence]);

    const handleEditOccurrence = async () => {
        if (!occurrence) return;

        const editedOccurrence = {
            id: occurrence.id,
            cancelled: true,
        };
        mutate(editedOccurrence.id, editedOccurrence);
        setModalState(null);
    };

    const handleEditEvent = async () => {
        if (!occurrence.event) return;

        const editedEvent = {
            id: occurrence.event.id,
            title,
            description,
            location,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            rule: isRecurring
                ? {
                      frequency: "DAILY",
                      params: daysToParams(
                          recurringDays,
                          utcDayOffset(startDate)
                      ),
                  }
                : undefined,
            end_recurring_period: isRecurring
                ? erpDate.toISOString() || null
                : null,
            course_id: occurrence.event.course_id,
        };

        try {
            await updateEvent(editedEvent);
            setModalState(null);
        } catch (error) {
            console.error("Error updating event:", error);
        }
    };

    const handleCancelOccurrence = () => {
        const editedOccurrence: Partial<ApiOccurrence> = {
            id: occurrence.id,
            cancelled: true,
        };
        mutate(editedOccurrence.id, editedOccurrence);
        setModalState(null);
    };

    const handleDeleteEvent = async () => {
        // Optimistically delete all without revalidation, then revalidate all.
        occurrences.forEach(
            (o) =>
                o.event.id === occurrence.event.id &&
                mutate(o.id, undefined, {
                    method: "DELETE",
                    sendRequest: false,
                    revalidate: false,
                })
        );
        setModalState(null);
        await deleteEvent(occurrence.event.id);
        mutate(undefined, undefined, { sendRequest: false });
    };

    const handleClose = () => {
        // If event is cancelled, uncancel (even if no edit).
        if (occurrence.cancelled) {
            const editedOccurrence: Partial<ApiOccurrence> = {
                id: occurrence.id,
                cancelled: false,
            };
            mutate(editedOccurrence.id, editedOccurrence);
        }

        // Close modal regardless.
        setModalState(null);
    };

    return (
        <Modal size="fullscreen" open={true} as={Form} onClose={handleClose}>
            {confirmModal}
            <Modal.Header>Edit Event</Modal.Header>
            <Modal.Content>
                <div style={{ display: "flex" }}>
                    <div
                        style={{
                            width: "50%",
                            borderRight: "1px solid #ddd",
                            paddingRight: "20px",
                            maxHeight: "70vh",
                            overflowY: "auto",
                        }}
                    >
                        <EventFormFields
                            title={title}
                            setTitle={setTitle}
                            description={description}
                            setDescription={setDescription}
                            startDate={startDate}
                            setStartDate={setStartDate}
                            endDate={endDate}
                            setEndDate={setEndDate}
                            location={location}
                            setLocation={setLocation}
                            isRecurring={isRecurring}
                            setIsRecurring={setIsRecurring}
                            recurringDays={recurringDays}
                            setRecurringDays={setRecurringDays}
                            erpDate={erpDate}
                            setErpDate={setErpDate}
                            isBookable={isBookable}
                            setIsBookable={setIsBookable}
                            interval={interval}
                            setInterval={setInterval}
                        />
                    </div>
                    <div
                        style={{
                            width: "50%",
                            paddingRight: "20px",
                            minHeight: "300px",
                        }}
                    >
                        <BookableVisualizer
                            startDate={startDate}
                            endDate={endDate}
                            interval={interval}
                            isBookable={isBookable}
                            title={title}
                        />
                    </div>
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    onClick={() =>
                        setConfirmModal(
                            <EditEventConfirmationModal
                                editOccurrence={handleCancelOccurrence}
                                editEvent={handleDeleteEvent}
                                onClose={() => setConfirmModal(undefined)}
                                title={`Delete ${
                                    occurrence.event.rule ? "Recurring " : ""
                                }Event`}
                                occurrenceText="Cancel This Event"
                                eventText={
                                    occurrence.event.rule
                                        ? "Delete All Events"
                                        : "Delete This Event"
                                }
                                occurrenceButtonProps={{ negative: true }}
                                eventButtonProps={{ negative: true }}
                            />
                        )
                    }
                    negative
                >
                    Delete Event
                </Button>
                <Button
                    onClick={() =>
                        setConfirmModal(
                            <EditEventConfirmationModal
                                editOccurrence={handleEditOccurrence}
                                editEvent={handleEditEvent}
                                onClose={() => setConfirmModal(undefined)}
                                title={
                                    isRecurring && occurrence.event.rule
                                        ? "Edit Recurring Event"
                                        : "Edit Event"
                                }
                                occurrenceText="Edit This Event"
                                eventText={
                                    isRecurring && occurrence.event.rule
                                        ? "Edit All Events"
                                        : "Edit This Event"
                                }
                                occurrenceButtonProps={{ positive: true }}
                                eventButtonProps={{ positive: true }}
                            />
                        )
                    }
                    positive
                    disabled={
                        endDate <= startDate ||
                        !title ||
                        (isRecurring &&
                            moment(erpDate).endOf("day").toDate() < endDate) ||
                        (isRecurring && recurringDays.length === 0)
                    }
                >
                    Edit Event
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

interface NewEventProps {
    show: boolean;
    setModalState: (status: boolean) => void;
    mutate: mutateResourceListFunction<ApiOccurrence>;
    courseId: number;
    start: Date;
    end: Date;
}

export const NewEventModal = (props: NewEventProps) => {
    const { show, setModalState, mutate, courseId, start, end } = props;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState(start);
    const [endDate, setEndDate] = useState(end);
    const [location, setLocation] = useState("");
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringDays, setRecurringDays] = useState([start.getDay()]);
    const [isBookable, setIsBookable] = useState(false);
    const [interval, setInterval] = useState(1);
    const [erpDate, setErpDate] = useState(end);
    const [lastSubmittedErp, setLastSubmittedErp] = useState<Date | undefined>(
        undefined
    );

    useEffect(() => {
        setTitle("");
        setDescription("");
        setStartDate(start);
        setEndDate(end);
        setIsRecurring(false);
        setRecurringDays([start.getDay()]);
        setIsBookable(false);
        setInterval(1);
        if (lastSubmittedErp && lastSubmittedErp < end) {
            setLastSubmittedErp(undefined);
            setErpDate(end);
        } else {
            setErpDate(lastSubmittedErp ?? end);
        }
    }, [show]);

    const handleCreateEvent = async () => {
        console.log("Starting handleCreateEvent");
        const newEvent: ApiPartialEvent = {
            title,
            start: dateToEventISO(startDate),
            end: dateToEventISO(endDate),
            description,
            location,
            course_id: courseId,
            rule: isRecurring
                ? {
                      frequency: "DAILY",
                      params: daysToParams(
                          recurringDays,
                          utcDayOffset(startDate)
                      ),
                  }
                : undefined,
            end_recurring_period: isRecurring
                ? dateToEventISO(moment(erpDate).endOf("day").toDate())
                : null,
            interval: isBookable ? interval * 15 : undefined,
        };
        console.log("Calling createEvent with payload:", newEvent);
        await createEvent(newEvent);
        console.log("createEvent completed successfully");
        mutate(undefined, undefined, { sendRequest: false });
        if (isRecurring) setLastSubmittedErp(erpDate);
        setModalState(false);
    };

    return (
        <Modal
            size="fullscreen"
            open={show}
            as={Form}
            onClose={() => setModalState(false)}
            onSubmit={handleCreateEvent}
        >
            <Modal.Header>New Event</Modal.Header>
            <Modal.Content style={{ height: "75vh" }}>
                <div
                    style={{
                        display: "flex",
                        height: "100%",
                    }}
                >
                    <div
                        style={{
                            width: "50%",
                            borderRight: "1px solid #ddd",
                            paddingRight: "20px",
                            height: "100%",
                            overflowY: "auto",
                        }}
                    >
                        <EventFormFields
                            title={title}
                            setTitle={setTitle}
                            description={description}
                            setDescription={setDescription}
                            startDate={startDate}
                            setStartDate={setStartDate}
                            endDate={endDate}
                            setEndDate={setEndDate}
                            location={location}
                            setLocation={setLocation}
                            isRecurring={isRecurring}
                            setIsRecurring={setIsRecurring}
                            recurringDays={recurringDays}
                            setRecurringDays={setRecurringDays}
                            erpDate={erpDate}
                            setErpDate={setErpDate}
                            isBookable={isBookable}
                            setIsBookable={setIsBookable}
                            interval={interval}
                            setInterval={setInterval}
                        />
                    </div>
                    <div
                        style={{
                            width: "50%",
                            paddingRight: "20px",
                            minHeight: "300px",
                            overflowY: "auto",
                        }}
                    >
                        <BookableVisualizer
                            startDate={startDate}
                            endDate={endDate}
                            interval={interval}
                            isBookable={isBookable}
                            title={title}
                        />
                    </div>
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={() => setModalState(false)}>Cancel</Button>
                <Button
                    positive
                    type="submit"
                    disabled={
                        endDate <= startDate ||
                        !title ||
                        (isRecurring &&
                            moment(erpDate).endOf("day").toDate() < endDate) ||
                        (isRecurring && recurringDays.length === 0)
                    }
                >
                    Create Event
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
