import { Button, ButtonProps, Form, Modal } from "semantic-ui-react";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import {
    DatePicker,
    LocalizationProvider,
    TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
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

const changeDate = (oldDate: Date, newDate: Date | null) =>
    newDate === null
        ? oldDate
        : new Date(
              newDate.getFullYear(),
              newDate.getMonth(),
              newDate.getDate(),
              oldDate.getHours(),
              oldDate.getMinutes(),
              oldDate.getSeconds()
          );

const changeTime = (oldTime: Date, newTime: Date | null) =>
    newTime === null
        ? oldTime
        : new Date(
              oldTime.getFullYear(),
              oldTime.getMonth(),
              oldTime.getDate(),
              newTime.getHours(),
              newTime.getMinutes(),
              newTime.getSeconds()
          );

const daysToParams = (days: number[]) =>
    days.length > 0
        ? days
              .sort()
              .reduce((acc, cur) => `${acc}${cur},`, "byweekday:")
              .slice(0, -1)
        : "";

interface DayOfWeekSelectorProps {
    days: number[];
    handleToggle: (day: number) => void;
}

const DayOfWeekSelector = (props: DayOfWeekSelectorProps) => {
    const { days, handleToggle } = props;

    return (
        <Form.Field>
            {["S", "M", "T", "W", "T", "F", "S"].map((dayChar, dayNum) => (
                <Button
                    key={dayNum}
                    circular
                    active={days.includes(dayNum)}
                    color={days.includes(dayNum) ? "blue" : undefined}
                    onClick={(e) => {
                        e.preventDefault();
                        handleToggle(dayNum);
                    }}
                >
                    {dayChar}
                </Button>
            ))}
        </Form.Field>
    );
};

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
    const [title, setTitle] = useState(occurrence.event.title);
    const [description, setDescription] = useState(
        occurrence.event.description
    );
    const [startField, setStartField] = useState(occurrence.start);
    const [endField, setEndField] = useState(occurrence.end);
    const [isRecurring, setIsRecurring] = useState(
        occurrence.event.rule !== null
    );
    const [recurringDays, setRecurringDays] = useState(
        occurrence.event.rule === null
            ? []
            : occurrence.event.rule.params
                  .substring(occurrence.event.rule.params.indexOf(":") + 1)
                  .split(",")
                  .map((s) => parseInt(s, 10))
    );
    const [erpField, setErpField] = useState(
        occurrence.event.end_recurring_period ?? occurrence.end
    );

    const [confirmModal, setConfirmModal] = useState<
        React.JSX.Element | undefined
    >(undefined);

    useEffect(() => {
        setTitle(occurrence.title);
        setDescription(occurrence.description);
        setStartField(occurrence.start);
        setEndField(occurrence.end);
        setIsRecurring(occurrence.event.rule !== null);
        setRecurringDays(
            occurrence.event.rule === null
                ? []
                : occurrence.event.rule.params
                      .slice(occurrence.event.rule.params.indexOf(":") + 1)
                      .split(",")
                      .map((s) => parseInt(s, 10))
        );
        setErpField(occurrence.event.end_recurring_period ?? occurrence.end);
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
        const timeDeltaStart =
            startField.getTime() - occurrence.start.getTime();
        const timeDeltaEnd = endField.getTime() - occurrence.end.getTime();
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
                ? { frequency: "WEEKLY", params: "byweekday:4,5" }
                : null,
            end_recurring_period: isRecurring ? dateToEventISO(erpField) : null,
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
                    <label htmlFor="edit-start-time-picker">Start Time</label>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <form id="edit-start-time-picker">
                            <DatePicker
                                value={startField}
                                onChange={(newDate) =>
                                    setStartField((oldDate) =>
                                        changeDate(oldDate, newDate)
                                    )
                                }
                            />
                            <TimePicker
                                value={startField}
                                onChange={(newTime) =>
                                    setStartField((oldTime) =>
                                        changeTime(oldTime, newTime)
                                    )
                                }
                                minutesStep={5}
                            />
                        </form>
                    </LocalizationProvider>
                </Form.Field>
                <Form.Field required>
                    <label htmlFor="edit-end-time-picker">End Time</label>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <form id="edit-end-time-picker">
                            <DatePicker
                                value={endField}
                                onChange={(newDate) =>
                                    setEndField((oldDate) =>
                                        changeDate(oldDate, newDate)
                                    )
                                }
                            />
                            <TimePicker
                                value={endField}
                                onChange={(newTime) =>
                                    setEndField((oldTime) =>
                                        changeTime(oldTime, newTime)
                                    )
                                }
                                minutesStep={5}
                            />
                        </form>
                    </LocalizationProvider>
                </Form.Field>
                <Form.Field>
                    <Form.Checkbox
                        label="Recurring Event"
                        checked={isRecurring}
                        onChange={() =>
                            setIsRecurring((oldIsRecurring) => !oldIsRecurring)
                        }
                    />
                </Form.Field>
                {isRecurring && (
                    <>
                        <DayOfWeekSelector
                            days={recurringDays}
                            handleToggle={(day) => {
                                setRecurringDays((days) =>
                                    days.includes(day)
                                        ? days
                                              .slice(0, days.indexOf(day))
                                              .concat(
                                                  days.slice(
                                                      days.indexOf(day) + 1,
                                                      days.length
                                                  )
                                              )
                                        : [...days, day]
                                );
                            }}
                        />
                        <Form.Field required>
                            <label htmlFor="edit-recurring-period-picker">
                                Recurring Period End Time
                            </label>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <form id="edit-recurring-period-picker">
                                    <DatePicker
                                        value={erpField}
                                        onChange={(newDate) =>
                                            setErpField((oldDate) =>
                                                changeDate(oldDate, newDate)
                                            )
                                        }
                                    />
                                    <TimePicker
                                        value={erpField}
                                        onChange={(newTime) =>
                                            setErpField((oldTime) =>
                                                changeTime(oldTime, newTime)
                                            )
                                        }
                                        minutesStep={5}
                                    />
                                </form>
                            </LocalizationProvider>
                        </Form.Field>
                    </>
                )}
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
    const [startField, setStartField] = useState(start);
    const [endField, setEndField] = useState(end);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringDays, setRecurringDays] = useState([start.getDay()]);
    const [erpField, setErpField] = useState(end);
    const [lastSubmittedErp, setLastSubmittedErp] = useState<Date | undefined>(
        undefined
    );

    useEffect(() => {
        setTitle("");
        setDescription("");
        setStartField(start);
        setEndField(end);
        setIsRecurring(false);
        setRecurringDays([start.getDay()]);
        setErpField(lastSubmittedErp ?? end);
    }, [show]);

    const handleCreateEvent = () => {
        console.log(daysToParams(recurringDays));
        const newEvent: ApiPartialEvent = {
            title,
            start: dateToEventISO(startField),
            end: dateToEventISO(endField),
            description,
            course_id: courseId,
            rule: isRecurring
                ? { frequency: "WEEKLY", params: daysToParams(recurringDays) }
                : null,
            end_recurring_period: isRecurring ? dateToEventISO(erpField) : null,
        };
        createEvent(newEvent);

        mutate(undefined, undefined, { sendRequest: false });
        if (isRecurring) setLastSubmittedErp(erpField);
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
                            <DatePicker
                                value={startField}
                                onChange={(newDate) =>
                                    setStartField((oldDate) =>
                                        changeDate(oldDate, newDate)
                                    )
                                }
                            />
                            <TimePicker
                                value={startField}
                                onChange={(newTime) =>
                                    setStartField((oldTime) =>
                                        changeTime(oldTime, newTime)
                                    )
                                }
                                minutesStep={5}
                            />
                        </form>
                    </LocalizationProvider>
                </Form.Field>
                <Form.Field required>
                    <label htmlFor="create-end-time-picker">End Time</label>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <form id="create-end-time-picker">
                            <DatePicker
                                value={endField}
                                onChange={(newDate) =>
                                    setEndField((oldDate) =>
                                        changeDate(oldDate, newDate)
                                    )
                                }
                            />
                            <TimePicker
                                value={endField}
                                onChange={(newTime) =>
                                    setEndField((oldTime) =>
                                        changeTime(oldTime, newTime)
                                    )
                                }
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
                        onChange={(e) =>
                            setIsRecurring((oldIsRecurring) => !oldIsRecurring)
                        }
                    />
                </Form.Field>
                {isRecurring && (
                    <>
                        <DayOfWeekSelector
                            days={recurringDays}
                            handleToggle={(day) => {
                                setRecurringDays((days) =>
                                    days.includes(day)
                                        ? days
                                              .slice(0, days.indexOf(day))
                                              .concat(
                                                  days.slice(
                                                      days.indexOf(day) + 1,
                                                      days.length
                                                  )
                                              )
                                        : [...days, day]
                                );
                            }}
                        />
                        <Form.Field required>
                            <label htmlFor="create-recurring-period-picker">
                                Recurring Period End Time
                            </label>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <form id="create-recurring-period-picker">
                                    <DatePicker
                                        value={erpField}
                                        onChange={(newDate) =>
                                            setErpField((oldDate) =>
                                                changeDate(oldDate, newDate)
                                            )
                                        }
                                    />
                                    <TimePicker
                                        value={erpField}
                                        onChange={(newTime) =>
                                            setErpField((oldTime) =>
                                                changeTime(oldTime, newTime)
                                            )
                                        }
                                        minutesStep={5}
                                    />
                                </form>
                            </LocalizationProvider>
                        </Form.Field>
                    </>
                )}
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
