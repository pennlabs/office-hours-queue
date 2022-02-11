import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function Calender() {
    return (
        <>
            <div>
                <Calendar
                    min={new Date(0, 0, 0, 0, 0, 0)}
                    max={new Date(0, 0, 0, 23, 0, 0)}
                    localizer={localizer}
                    events={[
                        {
                            title: "test",
                            start: new Date(Date.now()),
                            end: new Date(Date.now() + 1),
                            allDay: false,
                        },
                    ]}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                />
            </div>
        </>
    );
}
