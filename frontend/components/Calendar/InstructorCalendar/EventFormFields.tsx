import { Button, Form, Label } from "semantic-ui-react";
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
            <Form.Input
                label="Title"
                value={title}
                required
                onChange={(_, { value }) => setTitle(value as string)}
                style={{ marginBottom: "1.5em" }}
            />
            <Form.TextArea
                label="Description"
                style={{ height: "8rem", marginBottom: "1.5em" }}
                value={description}
                onChange={(_, { value }) => setDescription(value as string)}
            />
            <Form.Field
                required
                error={endDate <= startDate}
                style={{ marginBottom: "1.5em" }}
            >
                <label htmlFor="start-date-picker">Start</label>
                <div
                    id="start-date-picker"
                    style={{ display: "flex", gap: "10px" }}
                >
                    <DatePicker value={startDate} onChange={changeStartDate} />
                    <TimePicker
                        value={startDate}
                        onChange={changeStartDate}
                        minutesStep={5}
                    />
                </div>
            </Form.Field>
            <Form.Field
                required
                error={endDate <= startDate}
                style={{ marginBottom: "1.5em" }}
            >
                <label htmlFor="end-date-picker">End</label>
                <div
                    id="end-date-picker"
                    style={{ display: "flex", gap: "10px" }}
                >
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
                style={{ marginBottom: "1.5em" }}
            />
            <div
                style={{
                    background: "#f8f9fa",
                    padding: "1.5em",
                    borderRadius: "8px",
                    marginBottom: "1.5em",
                }}
            >
                <Form.Field>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: isRecurring ? "1.5em" : 0,
                        }}
                    >
                        <label
                            style={{
                                marginRight: "1em",
                                fontWeight: "bold",
                                fontSize: "1.1em",
                            }}
                        >
                            Recurring Event
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
                        <Form.Field error={recurringDays.length === 0}>
                            <div
                                style={{
                                    display: "flex",
                                    gap: "0.5em",
                                    flexWrap: "wrap",
                                    marginBottom: "1em",
                                }}
                            >
                                <Button
                                    size="tiny"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setRecurringDays([0, 1, 2, 3, 4, 5, 6]);
                                    }}
                                    style={{ marginBottom: "0.5em" }}
                                >
                                    Select All Days
                                </Button>
                                {["S", "M", "T", "W", "T", "F", "S"].map(
                                    (dayChar, dayNum) => (
                                        <Button
                                            key={dayNum}
                                            circular
                                            active={recurringDays.includes(
                                                dayNum
                                            )}
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
                            </div>
                        </Form.Field>
                        <Form.Field
                            required
                            error={
                                moment(erpDate).endOf("day").toDate() < endDate
                            }
                        >
                            <label htmlFor="recurring-period-picker">
                                Ends On
                            </label>
                            <div id="recurring-period-picker">
                                <DatePicker
                                    value={erpDate}
                                    onChange={setErpDate}
                                />
                            </div>
                        </Form.Field>
                    </>
                )}
            </div>
            <div
                style={{
                    background: "#f8f9fa",
                    padding: "1.5em",
                    borderRadius: "8px",
                    marginBottom: "1.5em",
                }}
            >
                <Form.Field>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: isBookable ? "1.5em" : 0,
                        }}
                    >
                        <label
                            style={{
                                marginRight: "1em",
                                fontWeight: "bold",
                                fontSize: "1.1em",
                            }}
                        >
                            Make this event bookable
                        </label>
                        <Form.Checkbox
                            toggle
                            checked={isBookable}
                            onChange={() => setIsBookable((old) => !old)}
                        />
                    </div>
                </Form.Field>
                {isBookable && (
                    <Form.Field>
                        <div style={{ display: "flex" }}>
                            <div>
                                <label htmlFor="interval-input">
                                    Booking Duration (minutes)
                                </label>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "1em",
                                    }}
                                >
                                    <input
                                        id="interval-input"
                                        type="range"
                                        min={15}
                                        max={Math.min(
                                            180,
                                            Math.floor(
                                                (endDate.getTime() -
                                                    startDate.getTime()) /
                                                    (60 * 1000)
                                            )
                                        )}
                                        value={Math.min(
                                            interval * 15,
                                            Math.floor(
                                                (endDate.getTime() -
                                                    startDate.getTime()) /
                                                    (60 * 1000)
                                            )
                                        )}
                                        onChange={(e) =>
                                            setInterval(
                                                Math.ceil(
                                                    Number(e.target.value) / 15
                                                )
                                            )
                                        }
                                        step={15}
                                        style={{ flex: 1 }}
                                    />
                                    <Label
                                        size="large"
                                        style={{
                                            fontFamily: "monospace",
                                            minWidth: "100px",
                                            textAlign: "center",
                                        }}
                                    >
                                        {Math.min(
                                            interval * 15,
                                            Math.floor(
                                                (endDate.getTime() -
                                                    startDate.getTime()) /
                                                    (60 * 1000)
                                            )
                                        )}{" "}
                                        minutes
                                    </Label>
                                </div>
                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: "#666",
                                        marginTop: "5px",
                                    }}
                                >
                                    Will create{" "}
                                    {Math.max(
                                        1,
                                        Math.floor(
                                            (endDate.getTime() -
                                                startDate.getTime()) /
                                                (interval * 15 * 60 * 1000)
                                        )
                                    )}{" "}
                                    slots
                                </div>
                            </div>
                        </div>
                    </Form.Field>
                )}
            </div>
        </LocalizationProvider>
    );
};
