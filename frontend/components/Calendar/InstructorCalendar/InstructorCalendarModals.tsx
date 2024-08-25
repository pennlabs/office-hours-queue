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
import { daysToParams, paramsToDays } from "../calendarUtils";

const utcDayOffset = (date: Date) =>
    date.getUTCDay() < date.getDay() ? 1 : date.getUTCDay() - date.getDay();

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
        setErpDate(occurrence.event.end_recurring_period ?? occurrence.end);
    }, [occurrence]);

    const handleEditOccurrence = () => {
        const editedOccurrence: Partial<ApiOccurrence> = {
            id: occurrence.id,
            title,
            description,
            location,
            start: dateToEventISO(startDate),
            end: dateToEventISO(endDate),
            cancelled: false,
        };
        mutate(editedOccurrence.id, editedOccurrence);
        setModalState(null);
    };

    const handleEditEvent = async () => {
        const start = startDate;
        const end = endDate;
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
            location,
            course_id: event.course_id,
            rule: isRecurring
                ? {
                      frequency: "DAILY",
                      params: daysToParams(
                          recurringDays,
                          utcDayOffset(
                              new Date(event.start.getTime() + timeDeltaStart)
                          )
                      ),
                  }
                : null,
            end_recurring_period: isRecurring
                ? dateToEventISO(moment(erpDate).endOf("day").toDate())
                : null,
        };
        await updateEvent(editedEvent);
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
        <Modal size="small" open={true} as={Form} onClose={handleClose}>
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
                    endDate={endDate}
                    location={location}
                    setLocation={setLocation}
                    setEndDate={setEndDate}
                    isRecurring={isRecurring}
                    setIsRecurring={setIsRecurring}
                    recurringDays={recurringDays}
                    setRecurringDays={setRecurringDays}
                    erpDate={erpDate}
                    setErpDate={setErpDate}
                />
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
                    disabled={
                        endDate <= startDate ||
                        moment(erpDate).endOf("day").toDate() < endDate ||
                        !title ||
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
        if (lastSubmittedErp && lastSubmittedErp < end) {
            setLastSubmittedErp(undefined);
            setErpDate(end);
        } else {
            setErpDate(lastSubmittedErp ?? end);
        }
    }, [show]);

    const handleCreateEvent = async () => {
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
        };
        await createEvent(newEvent);
        mutate(undefined, undefined, { sendRequest: false });
        if (isRecurring) setLastSubmittedErp(erpDate);
        setModalState(false);
    };

    return (
        <Modal
            size="small"
            open={show}
            as={Form}
            onClose={() => setModalState(false)}
            onSubmit={handleCreateEvent}
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
                />
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={() => setModalState(false)}>Cancel</Button>
                <Button
                    positive
                    type="submit"
                    disabled={
                        endDate <= startDate ||
                        moment(erpDate).endOf("day").toDate() < endDate ||
                        !title ||
                        (isRecurring && recurringDays.length === 0)
                    }
                >
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
    endDate: Date;
    setEndDate: (start: Date) => void;
    location: string;
    setLocation: (location: string) => void;
    isRecurring: boolean;
    setIsRecurring: (isRecurring: boolean | ((old: boolean) => void)) => void;
    recurringDays: number[];
    setRecurringDays: (days: number[] | ((old: number[]) => void)) => void;
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
        endDate,
        setEndDate,
        location,
        setLocation,
        isRecurring,
        setIsRecurring,
        recurringDays,
        setRecurringDays,
        erpDate,
        setErpDate,
    } = props;

    const toggleDay = (day: number, days: number[]) =>
        days.includes(day)
            ? days
                  .slice(0, days.indexOf(day))
                  .concat(days.slice(days.indexOf(day) + 1, days.length))
            : [...days, day];

    const stripTime = (day: Date) => new Date(day.toDateString());

    const changeStartDate = (day: Date | null) => {
        if (day === null) return;
        if (stripTime(day).getTime() !== stripTime(startDate).getTime())
            setRecurringDays([day.getDay()]);
        const timeDelta = day.getTime() - startDate.getTime();
        setStartDate(day);
        if (endDate > startDate)
            setEndDate(new Date(endDate.getTime() + timeDelta));
    };

    const changeEndDate = (day: Date | null) => {
        if (day === null) return;
        setEndDate(day);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
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
            <Form.Field required error={endDate <= startDate}>
                <label htmlFor="start-date-picker">Start</label>
                <div id="start-date-picker">
                    <DatePicker value={startDate} onChange={changeStartDate} />
                    <TimePicker
                        value={startDate}
                        onChange={changeStartDate}
                        minutesStep={5}
                    />
                </div>
            </Form.Field>
            <Form.Field required error={endDate <= startDate}>
                <label htmlFor="end-date-picker">End</label>
                <div id="end-date-picker">
                    <DatePicker value={endDate} onChange={changeEndDate} />
                    <TimePicker
                        value={endDate}
                        onChange={changeEndDate}
                        minutesStep={5}
                    />
                </div>
            </Form.Field>
            <Form.Input
                label="Location"
                value={location}
                onChange={(_, { value }) => setLocation(value as string)}
            />
            <Form.Field style={{ display: "flex" }}>
                <label
                    htmlFor="recurring-checkbox"
                    style={{ marginRight: "10px" }}
                >
                    Recurring Event
                </label>
                <Form.Checkbox
                    id="recurring-checkbox"
                    checked={isRecurring}
                    onChange={() => setIsRecurring((old) => !old)}
                />
            </Form.Field>
            {isRecurring && (
                <>
                    <Form.Field error={recurringDays.length === 0}>
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
                                        setRecurringDays((old) =>
                                            toggleDay(dayNum, old)
                                        );
                                    }}
                                >
                                    {dayChar}
                                </Button>
                            )
                        )}
                    </Form.Field>
                    <Form.Field
                        required
                        error={moment(erpDate).endOf("day").toDate() < endDate}
                    >
                        <label htmlFor="recurring-period-picker">Ends On</label>
                        <div id="recurring-period-picker">
                            <DatePicker value={erpDate} onChange={setErpDate} />
                        </div>
                    </Form.Field>
                </>
            )}
        </LocalizationProvider>
    );
};
