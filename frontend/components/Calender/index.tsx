/* eslint-disable */
import React, {
    useState,
    useCallback,
    Dispatch,
    SetStateAction,
    useEffect,
} from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import { Modal, Form, Button } from "semantic-ui-react";
import { TextField } from "@mui/material";
import { TimePicker, DatePicker, LocalizationProvider } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { createEvent } from "../../hooks/data-fetching/calendar";
import { PartialEvent, Event, CalendarEvent } from "../../types";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface EditEventProps {
    setModalState: Dispatch<SetStateAction<Event | null>>;
    mutate: mutateResourceListFunction<Event>;
    event: Event;
}
const EditEventModal = ({ setModalState, mutate, event }: EditEventProps) => {
    const { title, description, courseId } = event;
    const [inputTitle, setTitle] = useState(title);
    const [inputDescription, setDescription] = useState(description || "");

    async function handleSubmit(e) {
        e.preventDefault();
        const newEvent: Event = {
            title: inputTitle,
            id: event.id,
            start: event.start,
            end: event.end,
            description: inputDescription,
            courseId,
            endRecurringPeriod: event.endRecurringPeriod,
        };
        mutate(event.id, newEvent);

        setTitle("");
        setDescription("");
        setModalState(null);
    }

    return (
        <Modal
            size="small"
            open={true}
            as={Form}
            onSubmit={(e) => handleSubmit(e)}
        >
            <Modal.Header>Edit Event</Modal.Header>
            <Modal.Content>
                <Form.Input
                    label="Title"
                    required
                    value={inputTitle}
                    onChange={(_, { value }) => setTitle(value as string)}
                />
                <Form.TextArea
                    label="Description"
                    style={{ height: "8rem" }}
                    value={inputDescription}
                    onChange={(_, { value }) => setDescription(value as string)}
                />

                <Form.Field>
                    <label>Start</label>
                    <Form.Input value={event.start} />
                </Form.Field>
                <Form.Field>
                    <label>End</label>
                    <Form.Input value={event.end} />
                </Form.Field>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={() => setModalState(null)}>Cancel</Button>
                <Button
                    onClick={() => {
                        setModalState(null);
                        mutate(event.id, undefined, {
                            method: "DELETE",
                        });
                    }}
                    negative
                >
                    Delete Event
                </Button>
                <Button type="submit" positive>
                    Edit Event
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

interface NewEventProps {
    show: boolean;
    setModalState: (status: boolean) => void;
    mutate: mutateResourceListFunction<Event>;
    courseId: number;
    start: Date;
    end: Date;
}
const NewEventModal = ({
    show,
    setModalState,
    mutate,
    courseId,
    start,
    end,
}: NewEventProps) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(start);
    const [time, setTime] = useState(start);
    const [eDate, eSetDate] = useState(end);
    const [eTime, eSetTime] = useState(end);
    useEffect(() => {
        setDate(start);
        setTime(start);
    }, [start]);
    useEffect(() => {
        console.log("REWRITE");
        eSetDate(end);
        eSetTime(end);
    }, [end]);

    async function handleSubmit(e) {
        e.preventDefault();
        const startDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            time.getHours(),
            time.getMinutes(),
            time.getSeconds()
        );
        const endDate = new Date(
            eDate.getFullYear(),
            eDate.getMonth(),
            eDate.getDate(),
            eTime.getHours(),
            eTime.getMinutes(),
            eTime.getSeconds()
        );
        if (endDate < startDate) {
            console.log("PROBLEMS");
        }
        console.log(startDate, endDate);
        const newEvent: PartialEvent = {
            title,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            description,
            courseId,
            endRecurringPeriod: null,
        };
        await createEvent(newEvent);
        mutate(undefined, undefined, { sendRequest: false });
        setTitle("");
        setDescription("");
        setModalState(false);
    }
    return (
        <Modal
            size="small"
            open={show}
            as={Form}
            onSubmit={(e) => handleSubmit(e)}
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
                    <label>Start Time</label>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            value={date}
                            onChange={(newValue) => {
                                if (newValue != null) setDate(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        />
                        <TimePicker
                            value={time}
                            onChange={(newValue) => {
                                if (newValue != null) setTime(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                            minutesStep={15}
                        />
                    </LocalizationProvider>
                </Form.Field>
                <Form.Field required>
                    <label>End Time</label>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            value={eDate}
                            onChange={(newValue) => {
                                if (newValue != null) eSetDate(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        />
                        <TimePicker
                            value={eTime}
                            onChange={(newValue) => {
                                if (newValue != null) eSetTime(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                            minutesStep={15}
                        />
                    </LocalizationProvider>
                </Form.Field>
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

type CaledarProps = {
    courseId: number;
    events: Event[];
    mutate: mutateResourceListFunction<Event>;
};
export default function Calender(props: CaledarProps) {
    const { courseId, events, mutate } = props;
    const [editEvent, setEditEvent] = useState<Event | null>(null);

    const [newEvent, setNewEvent] = useState(false);
    const [start, setStart] = useState(new Date(1));
    const [end, setEnd] = useState(new Date(1));

    const handleSelectSlot = useCallback(async ({ start, end }) => {
        setNewEvent(true);
        setStart(new Date(start));
        setEnd(new Date(end));
    }, []);
    return (
        <>
            <div>
                <NewEventModal
                    show={newEvent}
                    setModalState={setNewEvent}
                    mutate={mutate}
                    courseId={courseId}
                    start={start}
                    end={end}
                />
                {editEvent && (
                    <EditEventModal
                        setModalState={setEditEvent}
                        mutate={mutate}
                        event={editEvent!}
                    />
                )}
                <Calendar
                    min={new Date(0, 0, 0, 9, 0, 0)}
                    max={new Date(0, 0, 0, 22, 0, 0)}
                    localizer={localizer}
                    defaultView={Views.WEEK}
                    events={events.map((event) => {
                        const { start, end, ...remainder } = event;
                        const reformatted: CalendarEvent = {
                            ...remainder,
                            start: new Date(start),
                            end: new Date(end),
                        };
                        return reformatted;
                    })}
                    eventPropGetter={({ resource }: { resource: Event }) => {
                        return {
                            style: {
                                backgroundColor: "#3C86CF",
                                color: "white",
                                borderRadius: "2",
                                border: "none",
                            },
                        };
                    }}
                    titleAccesor="description"
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600 }}
                    onSelectSlot={handleSelectSlot}
                    selectable={true}
                    onSelectEvent={(event: Event) => {
                        setEditEvent(event);
                    }}
                />
            </div>
        </>
    );
}
