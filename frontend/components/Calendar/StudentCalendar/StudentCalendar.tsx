import { Form, Grid, Header, Loader, Segment } from "semantic-ui-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import {
    apiOccurrenceToOccurrence,
    useOccurrences,
} from "../../../hooks/data-fetching/calendar";
import { Occurrence } from "../../../types";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { AuthUserContext } from "../../../context/auth";
import { useMemberships } from "../../../hooks/data-fetching/dashboard";
import {
    eventColors,
    eventColorsHex,
    filterSortMemberships,
    getMembershipIndex,
} from "../calendarUtils";
import { EventInfoModal } from "../CalendarCommon";

const localizer = momentLocalizer(moment);

export default function StudentCalendar() {
    const { user: initialUser } = useContext(AuthUserContext);
    if (initialUser === undefined) {
        throw new Error("Must be logged-in");
    }

    const membershipsSWR = useMemberships(initialUser);
    const memberships = filterSortMemberships(membershipsSWR.memberships);

    const [selectedCourses, setSelectedCourses] = useState(
        memberships.map((m) => m.course.id)
    );
    const mounted = useRef(false);
    const selectedCoursesJSON = JSON.stringify(selectedCourses.sort());
    useEffect(() => {
        if (!mounted.current) {
            const courseIds = memberships.map((m) => m.course.id);
            const stored = localStorage.getItem(
                "studentCalendarSelectedCourses"
            );
            if (stored === null) return;
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed))
                setSelectedCourses(
                    parsed.filter((courseId) => courseIds.includes(courseId))
                );
            mounted.current = true;
        } else {
            localStorage.setItem(
                "studentCalendarSelectedCourses",
                selectedCoursesJSON
            );
        }
    }, [selectedCoursesJSON]);

    const [selectedOccurrence, setSelectedOccurrence] =
        useState<Occurrence | null>(null);

    const selectedMembership = membershipsSWR.memberships.find(
        (m) => m.course.id === selectedOccurrence?.event.course_id
    );

    const toggleCourseSelection = (course: number, courses: number[]) =>
        courses.includes(course)
            ? courses
                  .slice(0, courses.indexOf(course))
                  .concat(
                      courses.slice(courses.indexOf(course) + 1, courses.length)
                  )
            : [...courses, course];

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
                            !o.cancelled &&
                            selectedCourses.includes(o.event.course_id)
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
                    onSelectEvent={(occurrence: Occurrence) =>
                        setSelectedOccurrence(occurrence)
                    }
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
                <Form
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        marginTop: "10px",
                    }}
                >
                    {/* separate instructor and student courses */}
                    {memberships.map((m) => (
                        <Form.Field
                            style={{
                                display: "flex",
                                marginRight: "20px",
                            }}
                        >
                            <Form.Button
                                id={m.course.id.toString()}
                                checked={selectedCourses.includes(m.course.id)}
                                color={
                                    selectedCourses.includes(m.course.id)
                                        ? eventColors[
                                              getMembershipIndex(
                                                  memberships,
                                                  m.course.id
                                              ) % eventColors.length
                                          ]
                                        : undefined
                                }
                                icon={
                                    selectedCourses.includes(m.course.id)
                                        ? "checkmark"
                                        : "blank"
                                }
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedCourses((old) =>
                                        toggleCourseSelection(m.course.id, old)
                                    );
                                }}
                                size="tiny"
                                style={{
                                    padding: "5px",
                                    marginRight: "10px",
                                }}
                                inline
                            />
                            <label
                                htmlFor={m.course.id.toString()}
                                style={{ marginTop: "1px" }}
                            >
                                {m.course.department} {m.course.courseCode}
                            </label>
                        </Form.Field>
                    ))}
                    {memberships.length > 0 && (
                        <>
                            <a
                                role="button"
                                onClick={() =>
                                    setSelectedCourses(
                                        memberships.map((m) => m.course.id)
                                    )
                                }
                                style={{
                                    marginTop: "2px",
                                    marginRight: "20px",
                                    cursor: "pointer",
                                }}
                            >
                                Select All
                            </a>
                            <a
                                role="button"
                                onClick={() => setSelectedCourses([])}
                                style={{
                                    marginTop: "2px",
                                    cursor: "pointer",
                                }}
                            >
                                Clear
                            </a>
                        </>
                    )}
                </Form>
            </Segment>

            <EventInfoModal
                occurrence={selectedOccurrence}
                membership={selectedMembership}
                setOccurrence={setSelectedOccurrence}
            />
        </Grid.Column>
    );
}
