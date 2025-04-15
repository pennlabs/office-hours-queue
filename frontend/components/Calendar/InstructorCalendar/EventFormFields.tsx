import { Button, Form, Header, Label, Select } from "semantic-ui-react";
import {
    DatePicker,
    LocalizationProvider,
    TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import moment from "moment";

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
    isBookable: boolean;
    setIsBookable: (isBookable: boolean | ((old: boolean) => void)) => void;
    interval: number;
    setInterval: (interval: number) => void;
}

export const EventFormFields = (props: EventFormFieldsProps) => {
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
        isBookable,
        setIsBookable,
        interval,
        setInterval,
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
            <div style={{ padding: "20px" }}>
                <Header as="h2" style={{ marginBottom: "30px" }}>
                    Event Details
                </Header>

                <div style={{ marginBottom: "30px" }}>
                    <Header as="h3" style={{ marginBottom: "15px" }}>
                        Basic Information
                    </Header>
                    <Form.Input
                        label="Title"
                        value={title}
                        placeholder="Untitled Event"
                        required
                        onChange={(_, { value }) => setTitle(value as string)}
                        style={{ marginBottom: "20px" }}
                    />

                    <Form.TextArea
                        label="Description"
                        style={{ height: "100px", marginBottom: "20px" }}
                        value={description}
                        onChange={(_, { value }) =>
                            setDescription(value as string)
                        }
                    />

                    <Form.Input
                        label="Location"
                        value={location}
                        onChange={(_, { value }) =>
                            setLocation(value as string)
                        }
                        style={{ marginBottom: "20px" }}
                    />
                </div>

                <div style={{ marginBottom: "30px" }}>
                    <Header as="h3" style={{ marginBottom: "15px" }}>
                        Time
                    </Header>
                    <div
                        style={{
                            display: "flex",
                            gap: "20px",
                            flexDirection: "column",
                        }}
                    >
                        <Form.Field style={{ flex: 1 }}>
                            <label
                                style={{
                                    fontSize: "1.1em",
                                    marginBottom: "8px",
                                    display: "block",
                                }}
                            >
                                Start
                            </label>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <DatePicker
                                    value={startDate}
                                    onChange={changeStartDate}
                                />
                                <TimePicker
                                    value={startDate}
                                    onChange={changeStartDate}
                                    minutesStep={5}
                                />
                            </div>
                        </Form.Field>
                        <Form.Field style={{ flex: 1 }}>
                            <label
                                style={{
                                    fontSize: "1.1em",
                                    marginBottom: "8px",
                                    display: "block",
                                }}
                            >
                                End
                            </label>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <DatePicker
                                    value={endDate}
                                    onChange={changeEndDate}
                                />
                                <TimePicker
                                    value={endDate}
                                    onChange={changeEndDate}
                                    minutesStep={5}
                                />
                            </div>
                        </Form.Field>
                    </div>
                </div>

                <div style={{ marginBottom: "30px" }}>
                    <Header as="h3" style={{ marginBottom: "15px" }}>
                        Recurrence
                    </Header>
                    <Form.Field>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <label style={{ fontSize: "1.1em" }}>
                                Repeat this event
                            </label>
                            <Form.Checkbox
                                toggle
                                checked={isRecurring}
                                onChange={() => setIsRecurring((old) => !old)}
                            />
                        </div>
                    </Form.Field>
                    {isRecurring && (
                        <>
                            <Form.Field style={{ marginTop: "15px" }}>
                                <label
                                    style={{
                                        fontSize: "1.1em",
                                        marginBottom: "8px",
                                        display: "block",
                                    }}
                                >
                                    Repeat on
                                </label>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {["S", "M", "T", "W", "T", "F", "S"].map(
                                        (dayChar, dayNum) => (
                                            <Button
                                                key={dayNum}
                                                circular
                                                active={recurringDays.includes(
                                                    dayNum
                                                )}
                                                color={
                                                    recurringDays.includes(
                                                        dayNum
                                                    )
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
                                </div>
                            </Form.Field>
                            <Form.Field style={{ marginTop: "15px" }}>
                                <label
                                    style={{
                                        fontSize: "1.1em",
                                        marginBottom: "8px",
                                        display: "block",
                                    }}
                                >
                                    Ends on
                                </label>
                                <DatePicker
                                    value={erpDate}
                                    onChange={setErpDate}
                                />
                            </Form.Field>
                        </>
                    )}
                </div>

                <div style={{ marginBottom: "30px" }}>
                    <Header as="h3" style={{ marginBottom: "15px" }}>
                        Booking
                    </Header>
                    <Form.Field>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <label style={{ fontSize: "1.1em" }}>
                                Allow students to book slots
                            </label>
                            <Form.Checkbox
                                toggle
                                checked={isBookable}
                                onChange={() => setIsBookable((old) => !old)}
                            />
                        </div>
                    </Form.Field>
                    {isBookable && (
                        <Form.Field style={{ marginTop: "15px" }}>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                }}
                            >
                                <label
                                    style={{
                                        fontSize: "1.1em",
                                        marginBottom: "8px",
                                        display: "block",
                                    }}
                                >
                                    Booking duration
                                </label>
                                <p style={{ color: "#666", margin: 0 }}>
                                    How long can a student book a slot for?
                                </p>
                                <Select
                                    options={[
                                        {
                                            key: "15",
                                            text: "15 minutes",
                                            value: 15,
                                        },
                                        {
                                            key: "30",
                                            text: "30 minutes",
                                            value: 30,
                                        },
                                        {
                                            key: "45",
                                            text: "45 minutes",
                                            value: 45,
                                        },
                                        {
                                            key: "60",
                                            text: "1 hour",
                                            value: 60,
                                        },
                                    ]}
                                    onChange={(_, data) =>
                                        setInterval(data.value as number)
                                    }
                                    defaultValue={interval}
                                    value={interval}
                                    style={{
                                        marginTop: "10px",
                                        position: "relative",
                                        transition:
                                            "opacity 0.2s ease, visibility 0.2s ease",
                                    }}
                                />
                                <p
                                    style={{
                                        color: "#666",
                                        fontSize: "0.9em",
                                        marginTop: "5px",
                                    }}
                                >
                                    Will create{" "}
                                    {Math.max(
                                        1,
                                        Math.floor(
                                            (endDate.getTime() -
                                                startDate.getTime()) /
                                                (interval * 60 * 1000)
                                        )
                                    )}{" "}
                                    slots
                                </p>
                            </div>
                        </Form.Field>
                    )}
                </div>
                <div style={{ height: !isBookable ? "150px" : "80px" }}></div>
            </div>
        </LocalizationProvider>
    );
};
