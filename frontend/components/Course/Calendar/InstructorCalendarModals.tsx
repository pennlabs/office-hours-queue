import { Button, ButtonProps, Form, Modal } from "semantic-ui-react";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import {
    DatePicker,
    LocalizationProvider,
    TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import moment from "moment";
import {
    createEvent,
    dateToEventISO,
    deleteEvent,
    updateEvent,
} from "../../../hooks/data-fetching/calendar";
import {
    ApiEvent,
    ApiOccurrence,
    ApiPartialEvent,
    Occurrence,
} from "../../../types";

const combineDateTime = (date: Date, time: Date) =>
    new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes(),
        time.getSeconds()
    );

const daysToParams = (days: number[]) =>
    days.length > 0
        ? days
              .sort()
              .reduce((acc, cur) => `${acc}${cur},`, "byweekday:")
              .slice(0, -1)
        : "";

const paramsToDays = (params: string) =>
    params
        .substring(params.indexOf(":") + 1)
        .split(",")
        .map((s) => parseInt(s, 10));

const toggleDay = (day: number, days: number[]) =>
    days.includes(day)
        ? days
              .slice(0, days.indexOf(day))
              .concat(days.slice(days.indexOf(day) + 1, days.length))
        : [...days, day];

interface EditOccurrenceEventProps {
    editOccurrence: () => void;
    editEvent: () => void;
    onClose: () => void;
    title: string;
    occurrenceText?: string;
    eventText?: string;
    occurrenceButtonProps?: ButtonProps;
    eventButtonProps?: ButtonProps;
}

const EditEventConfirmationModal = (props: EditOccurrenceEventProps) => {
    const {
        editOccurrence,
        editEvent,
        onClose,
        title,
        occurrenceText,
        eventText,
        occurrenceButtonProps,
        eventButtonProps,
    } = props;
    return (
        <Modal size="tiny" open={true} as={Form} onClose={onClose}>
            <Modal.Header>{title}</Modal.Header>
            <Modal.Actions>
                <Button onClick={onClose}>Cancel</Button>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <Button onClick={editOccurrence} {...occurrenceButtonProps}>
                    {occurrenceText}
                </Button>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <Button onClick={editEvent} {...eventButtonProps}>
                    {eventText}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

interface EditCancelledOccurrenceProps {
    occurrence: Occurrence | null;
    onClose: () => void;
    onSubmit: (occurrence: Occurrence, uncancel: boolean) => void;
}

export const EditCancelledOccurrenceModal = (
    props: EditCancelledOccurrenceProps
) => {
    const { occurrence, onClose, onSubmit } = props;

    return (
        <Modal
            size="tiny"
            open={occurrence !== null}
            as={Form}
            onClose={onClose}
        >
            <Modal.Header>Cancelled Event</Modal.Header>
            <Modal.Content>
                <Modal.Description>
                    This event has been marked as cancelled. Would you like to
                    uncancel it?
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={() => onSubmit(occurrence!, false)} negative>
                    No
                </Button>
                <Button onClick={() => onSubmit(occurrence!, true)} positive>
                    Yes
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

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
    const [startTime, setStartTime] = useState(occurrence.start);
    const [endDate, setEndDate] = useState(occurrence.end);
    const [endTime, setEndTime] = useState(occurrence.end);
    const [isRecurring, setIsRecurring] = useState(
        occurrence.event.rule !== null
    );
    const [recurringDays, setRecurringDays] = useState(
        occurrence.event.rule === null
            ? []
            : paramsToDays(occurrence.event.rule.params)
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
        setStartTime(occurrence.start);
        setEndDate(occurrence.end);
        setEndTime(occurrence.end);
        setIsRecurring(occurrence.event.rule !== null);
        setRecurringDays(
            occurrence.event.rule === null
                ? []
                : paramsToDays(occurrence.event.rule.params)
        );
        setErpDate(occurrence.event.end_recurring_period ?? occurrence.end);
    }, [occurrence]);

    const handleEditOccurrence = () => {
        const editedOccurrence: Partial<ApiOccurrence> = {
            id: occurrence.id,
            title,
            description,
            start: dateToEventISO(occurrence.start),
            end: dateToEventISO(occurrence.end),
        };
        mutate(editedOccurrence.id, editedOccurrence);
        setModalState(null);
    };

    const handleEditEvent = () => {
        const start = combineDateTime(startDate, startTime);
        const end = combineDateTime(endDate, endTime);
        const timeDeltaStart = start.getTime() - occurrence.start.getTime();
        const timeDeltaEnd = end.getTime() - occurrence.end.getTime();
        const { event } = occurrence;
        const editedEvent: ApiEvent = {
            id: event.id,
            title,
            start: dateToEventISO(
                new Date(event.start.getTime() + timeDeltaStart)
            ),
            end: dateToEventISO(new Date(event.end.getTime() + timeDeltaEnd)),
            description,
            course_id: event.course_id,
            rule: isRecurring
                ? { frequency: "WEEKLY", params: daysToParams(recurringDays) }
                : null,
            end_recurring_period: isRecurring
                ? dateToEventISO(moment(erpDate).endOf("day").toDate())
                : null,
        };
        updateEvent(editedEvent);
        // Revalidate everything, since new event could have created many new occurrences.
        mutate(undefined, undefined, { sendRequest: false });
        setModalState(null);
    };

    const handleCancelOccurrence = () => {
        const editedOccurrence: Partial<ApiOccurrence> = {
            id: occurrence.id,
            cancelled: true,
        };
        mutate(editedOccurrence.id, editedOccurrence);
        setModalState(null);
    };

    const handleDeleteEvent = () => {
        deleteEvent(occurrence.event.id);
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
        mutate(undefined, undefined, { sendRequest: false });
        setModalState(null);
    };

    return (
        <Modal
            size="small"
            open={true}
            as={Form}
            onClose={() => setModalState(null)}
        >
            {confirmModal}
            <Modal.Header>Edit Event</Modal.Header>
            <Modal.Content>
                <EventFormFields
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    startTime={startTime}
                    setStartTime={setStartTime}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    endTime={endTime}
                    setEndTime={setEndTime}
                    isRecurring={isRecurring}
                    toggleIsRecurring={() => setIsRecurring((old) => !old)}
                    recurringDays={recurringDays}
                    toggleRecurringDays={(day) =>
                        setRecurringDays((days) => toggleDay(day, days))
                    }
                    erpDate={erpDate}
                    setErpDate={setErpDate}
                />
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={() => setModalState(null)}>Cancel</Button>
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
                        isRecurring && occurrence.event.rule
                            ? setConfirmModal(
                                  <EditEventConfirmationModal
                                      editOccurrence={handleEditOccurrence}
                                      editEvent={handleEditEvent}
                                      onClose={() => setConfirmModal(undefined)}
                                      title="Edit Recurring Event"
                                      occurrenceText="Edit This Event"
                                      eventText="Edit All Events"
                                      occurrenceButtonProps={{ positive: true }}
                                      eventButtonProps={{ positive: true }}
                                  />
                              )
                            : handleEditEvent()
                    }
                    positive
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
    const [startTime, setStartTime] = useState(start);
    const [endDate, setEndDate] = useState(end);
    const [endTime, setEndTime] = useState(end);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringDays, setRecurringDays] = useState([start.getDay()]);
    const [erpDate, setErpDate] = useState(end);
    const [lastSubmittedErp, setLastSubmittedErp] = useState<Date | undefined>(
        undefined
    );

    useEffect(() => {
        setTitle("");
        setDescription("");
        setStartDate(start);
        setStartTime(start);
        setEndDate(end);
        setEndTime(end);
        setIsRecurring(false);
        setRecurringDays([start.getDay()]);
        setErpDate(lastSubmittedErp ?? end);
    }, [show]);

    const handleCreateEvent = () => {
        const newEvent: ApiPartialEvent = {
            title,
            start: dateToEventISO(combineDateTime(startDate, startTime)),
            end: dateToEventISO(combineDateTime(endDate, endTime)),
            description,
            course_id: courseId,
            rule: isRecurring
                ? { frequency: "WEEKLY", params: daysToParams(recurringDays) }
                : undefined,
            end_recurring_period: isRecurring
                ? dateToEventISO(moment(erpDate).endOf("day").toDate())
                : null,
        };
        createEvent(newEvent);

        mutate(undefined, undefined, { sendRequest: false });
        if (isRecurring) setLastSubmittedErp(erpDate);
        setModalState(false);
    };

    return (
        <Modal
            size="small"
            open={show}
            as={Form}
            onSubmit={handleCreateEvent}
            onClose={() => setModalState(false)}
        >
            <Modal.Header>New Event</Modal.Header>
            <Modal.Content>
                <EventFormFields
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    startTime={startTime}
                    setStartTime={setStartTime}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    endTime={endTime}
                    setEndTime={setEndTime}
                    isRecurring={isRecurring}
                    toggleIsRecurring={() => setIsRecurring((old) => !old)}
                    recurringDays={recurringDays}
                    toggleRecurringDays={(day) =>
                        setRecurringDays((days) => toggleDay(day, days))
                    }
                    erpDate={erpDate}
                    setErpDate={setErpDate}
                />
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={() => setModalState(false)}>Cancel</Button>
                <Button positive type="submit">
                    Create Event
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

interface EventFormFieldsProps {
    title: string;
    setTitle: (title: string) => void;
    description: string;
    setDescription: (description: string) => void;
    startDate: Date;
    setStartDate: (start: Date) => void;
    startTime: Date;
    setStartTime: (start: Date) => void;
    endDate: Date;
    setEndDate: (start: Date) => void;
    endTime: Date;
    setEndTime: (start: Date) => void;
    isRecurring: boolean;
    toggleIsRecurring: () => void;
    recurringDays: number[];
    toggleRecurringDays: (day: number) => void;
    erpDate: Date;
    setErpDate: (erp: Date) => void;
}

const EventFormFields = (props: EventFormFieldsProps) => {
    const {
        title,
        setTitle,
        description,
        setDescription,
        startDate,
        setStartDate,
        startTime,
        setStartTime,
        endDate,
        setEndDate,
        endTime,
        setEndTime,
        isRecurring,
        toggleIsRecurring,
        recurringDays,
        toggleRecurringDays,
        erpDate,
        setErpDate,
    } = props;

    return (
        <>
            <Form.Input
                label="Title"
                value={title}
                required
                onChange={(_, { value }) => setTitle(value as string)}
            />
            <Form.TextArea
                label="Description"
                style={{ height: "8rem" }}
                value={description}
                onChange={(_, { value }) => setDescription(value as string)}
            />

            <Form.Field required>
                <label htmlFor="create-start-time-picker">Start Time</label>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <form id="create-start-time-picker">
                        <DatePicker value={startDate} onChange={setStartDate} />
                        <TimePicker
                            value={startTime}
                            onChange={setStartTime}
                            minutesStep={5}
                        />
                    </form>
                </LocalizationProvider>
            </Form.Field>
            <Form.Field required>
                <label htmlFor="create-end-time-picker">End Time</label>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <form id="create-end-time-picker">
                        <DatePicker value={endDate} onChange={setEndDate} />
                        <TimePicker
                            value={endTime}
                            onChange={setEndTime}
                            minutesStep={5}
                        />
                    </form>
                </LocalizationProvider>
            </Form.Field>
            <Form.Field>
                <label htmlFor="create-recurring-checkbox">
                    Recurring Event
                </label>
                <Form.Checkbox
                    id="create-recurring-checkbox"
                    checked={isRecurring}
                    onChange={toggleIsRecurring}
                />
            </Form.Field>
            {isRecurring && (
                <>
                    <Form.Field>
                        {["S", "M", "T", "W", "T", "F", "S"].map(
                            (dayChar, dayNum) => (
                                <Button
                                    key={dayNum} // eslint-disable-line react/no-array-index-key
                                    circular
                                    active={recurringDays.includes(dayNum)}
                                    color={
                                        recurringDays.includes(dayNum)
                                            ? "blue"
                                            : undefined
                                    }
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleRecurringDays(dayNum);
                                    }}
                                >
                                    {dayChar}
                                </Button>
                            )
                        )}
                    </Form.Field>
                    <Form.Field required>
                        <label htmlFor="create-recurring-period-picker">
                            Recurring Period End Time
                        </label>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <form id="create-recurring-period-picker">
                                <DatePicker
                                    value={erpDate}
                                    onChange={setErpDate}
                                />
                            </form>
                        </LocalizationProvider>
                    </Form.Field>
                </>
            )}
        </>
    );
};
