import { Grid, Header, Loader, Segment } from "semantic-ui-react";
import React, { useContext, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import {
    apiOccurrenceToOccurrence,
    useOccurrences,
} from "../../hooks/data-fetching/calendar";
import { Occurrence } from "../../types";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { AuthUserContext } from "../../context/auth";
import { useMemberships } from "../../hooks/data-fetching/dashboard";
import {
    eventColors,
    eventColorsHex,
    filterSortMemberships,
    getMembershipIndex,
} from "./calendarUtils";

const localizer = momentLocalizer(moment);

export default function StudentCalendar() {
    const { user: initialUser } = useContext(AuthUserContext);
    if (initialUser === undefined) {
        throw new Error("Must be logged-in");
    }

    const membershipsSWR = useMemberships(initialUser);
    const memberships = filterSortMemberships(membershipsSWR.memberships);

    const [selectedCourses, setSelectedCourses] = useState(() => {
        const initialSelectedCourses = {};
        memberships.forEach((m) => {
            initialSelectedCourses[m.course.id.toString()] = false;
        });
        return initialSelectedCourses;
    });

    const handleCheckboxChange = (courseId) => {
        setSelectedCourses({
            ...selectedCourses,
            [courseId]: !selectedCourses[courseId],
        });
    };

    // Load whole month at a time to reduce revalidation and enable more optimistic updates.
    const { data, setFilter } = useOccurrences(
        memberships.map((m) => m.course.id),
        moment().startOf("month").weekday(0).toDate(),
        moment().endOf("month").weekday(7).toDate()
    );

    const occurrences: Occurrence[] = (data || []).map(
        apiOccurrenceToOccurrence
    );

    return (
        <Grid.Column width={13}>
            <Segment basic>
                <Header as="h2">Calendar</Header>
                <Loader size="massive" active={data === undefined} />
                <Calendar
                    scrollToTime={new Date(0, 0, 0, 9, 0, 0)}
                    localizer={localizer}
                    defaultView={Views.WEEK}
                    views={["month", "week", "day"]}
                    showMultiDayTimes={true}
                    events={occurrences.filter(
                        (o: Occurrence) =>
                            !o.cancelled && selectedCourses[o.event.course_id]
                    )}
                    eventPropGetter={(o: Occurrence) => {
                        const courseIndex = getMembershipIndex(
                            memberships,
                            o.event.course_id
                        );

                        return {
                            style: {
                                backgroundColor:
                                    eventColorsHex[
                                        eventColors[
                                            courseIndex % eventColors.length
                                        ]
                                    ],
                                brightness: "100%",
                                color: "white",
                                borderRadius: "2",
                                border: "none",
                            },
                        };
                    }}
                    tooltipAccessor="description"
                    style={{ height: 600 }}
                    // onSelectEvent={(occurrence: Occurrence) =>
                    // open modal with information of event + description
                    // course queue if student
                    // course calendar if instructor
                    // }
                    onRangeChange={(
                        range: Date[] | { start: Date; end: Date }
                    ) => {
                        if (Array.isArray(range)) {
                            setFilter({
                                start: moment(range[0])
                                    .startOf("month")
                                    .weekday(0)
                                    .toDate(),
                                end: moment(range[0])
                                    .endOf("month")
                                    .weekday(7)
                                    .toDate(),
                            });
                        } else {
                            setFilter({
                                start: range.start,
                                end: range.end,
                            });
                        }
                    }}
                />
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        marginTop: "10px",
                    }}
                >
                    {/* separate instructor and student courses */}
                    {memberships.map((m) => (
                        <div
                            key={m.course.id}
                            style={{
                                marginRight: "15px",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <input
                                type="checkbox"
                                id={m.course.id.toString()}
                                checked={
                                    selectedCourses[m.course.id.toString()]
                                }
                                onChange={() =>
                                    handleCheckboxChange(m.course.id.toString())
                                }
                                style={{ marginRight: "3px" }}
                            />
                            <label
                                htmlFor={m.course.id.toString()}
                                style={{
                                    color: eventColorsHex[
                                        eventColors[
                                            getMembershipIndex(
                                                memberships,
                                                m.course.id
                                            ) % eventColors.length
                                        ]
                                    ],
                                }}
                            >
                                {m.course.department} {m.course.courseCode}
                            </label>
                        </div>
                    ))}
                </div>
            </Segment>
        </Grid.Column>
    );
}
