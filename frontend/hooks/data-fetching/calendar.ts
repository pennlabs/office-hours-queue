import { useResourceList } from "@pennlabs/rest-hooks";
import { useEffect, useState } from "react";
import {
    ApiBooking,
    ApiEvent,
    ApiOccurrence,
    ApiPartialEvent,
    Booking,
    Event,
    Occurrence,
} from "../../types";
import { doApiRequest } from "../../utils/fetch";
import { logException } from "../../utils/sentry";
import { CALENDAR_POLL_INTERVAL } from "../../constants";

export const dateToEventISO = (date: Date): string =>
    date.toISOString().replace(/\.\d+/, "");

export const apiEventToEvent = (apiEvent: ApiEvent): Event => {
    return {
        ...apiEvent,
        start: new Date(apiEvent.start),
        end: new Date(apiEvent.end),
        rule: apiEvent.rule ?? null,
        end_recurring_period: apiEvent.end_recurring_period
            ? new Date(apiEvent.end_recurring_period!)
            : null,
    };
};

export const eventToApiEvent = (event: Event): ApiEvent => {
    return {
        ...event,
        start: dateToEventISO(event.start),
        end: dateToEventISO(event.end),
        rule: event.rule === null ? undefined : event.rule,
        end_recurring_period: event.end_recurring_period
            ? dateToEventISO(event.end_recurring_period)
            : null,
    };
};

export const apiOccurrenceToOccurrence = (
    apiOccurrence: ApiOccurrence
): Occurrence => {
    return {
        ...apiOccurrence,
        start: new Date(apiOccurrence.start),
        end: new Date(apiOccurrence.end),
        event:
            typeof apiOccurrence.event === "object"
                ? apiEventToEvent(apiOccurrence.event)
                : apiEventToEvent({
                      id: apiOccurrence.event,
                  } as unknown as ApiEvent),
    };
};

export const useEvents = (courseIds: number[]) => {
    const courseIdQuery = courseIds.reduce(
        (prev, cur) => (prev ? `${prev}&course=${cur}` : `course=${cur}`),
        ""
    );

    const { data, error, isValidating } = useResourceList<ApiEvent>(
        `/api/events/?${courseIdQuery}`,
        (id) => `/api/events/${id}/`,
        {
            revalidateOnFocus: false,
            refreshInterval: CALENDAR_POLL_INTERVAL,
        }
    );

    return { data, error, isValidating };
};

export const useOccurrences = (courseIds: number[], start: Date, end: Date) => {
    const [filter, setFilter] = useState({ start, end });

    const courseIdQuery = courseIds.reduce(
        (prev, cur) => (prev ? `${prev}&course=${cur}` : `course=${cur}`),
        ""
    );

    const { data, error, isValidating, mutate } =
        useResourceList<ApiOccurrence>(
            `/api/occurrences/?${courseIdQuery}&filter_start=${dateToEventISO(
                filter.start
            )}&filter_end=${dateToEventISO(filter.end)}`,
            (id) => `/api/occurrences/${id}/`,
            {
                revalidateOnFocus: false,
                refreshInterval: CALENDAR_POLL_INTERVAL,
            }
        );

    const filterStartString = filter.start.toISOString();
    const filterEndString = filter.end.toISOString();
    useEffect(() => {
        mutate(undefined, undefined, { sendRequest: false });
    }, [filterStartString, filterEndString]);

    return {
        data,
        error,
        isValidating,
        mutate,
        setFilter,
    };
};

export const useOccurrenceUpdate = (occurrenceId: number) => {
    const { mutate } = useResourceList<ApiOccurrence>(
        `/api/occurrences/${occurrenceId}/`,
        (id) => `/api/occurrences/${id}/`,
        {
            revalidateOnFocus: false,
        }
    );
    return mutate;
};

export async function updateOccurrence(
    occurrenceId: number,
    payload: Partial<ApiOccurrence>
): Promise<ApiOccurrence> {
    const res = await doApiRequest(`/api/occurrences/${occurrenceId}/`, {
        method: "PATCH",
        body: payload,
    });
    if (!res.ok) {
        const errorObj = Error(JSON.stringify(await res.json()));
        logException(errorObj, JSON.stringify(payload));
        throw errorObj;
    }
    return res.json();
}

export async function createEvent(payload: ApiPartialEvent): Promise<ApiEvent> {
    console.log("Starting createEvent with payload:", payload);

    // First create the event without bookable settings
    const eventPayload = {
        ...payload,
        interval: undefined,
    };
    console.log("Creating event with payload:", eventPayload);

    const res = await doApiRequest("/api/events/", {
        method: "POST",
        body: eventPayload,
    });
    if (!res.ok) {
        const errorObj = Error(JSON.stringify(await res.json()));
        logException(errorObj, JSON.stringify(eventPayload));
        throw errorObj;
    }
    const event = await res.json();
    console.log("Event created successfully:", event);

    // If the event is bookable, update all occurrences with the interval
    if (payload.interval) {
        console.log(
            "Event is bookable, updating occurrences with interval:",
            payload.interval
        );

        // Get all occurrences for this event with date filters
        const startDate = new Date(payload.start);
        const endDate = new Date(payload.end);
        console.log("Fetching occurrences between:", startDate, "and", endDate);

        const occurrencesRes = await doApiRequest(
            `/api/occurrences/?event=${event.id}&filter_start=${dateToEventISO(
                startDate
            )}&filter_end=${dateToEventISO(endDate)}`,
            {
                method: "GET",
            }
        );
        if (!occurrencesRes.ok) {
            const errorObj = Error(JSON.stringify(await occurrencesRes.json()));
            logException(errorObj, JSON.stringify(payload));
            throw errorObj;
        }
        const occurrences = await occurrencesRes.json();
        console.log("Found occurrences:", occurrences);

        // Update each occurrence with the interval
        for (const occurrence of occurrences) {
            console.log(
                "Updating occurrence:",
                occurrence.id,
                "with interval:",
                payload.interval
            );
            await updateOccurrence(occurrence.id, {
                interval: payload.interval,
            });
            console.log("Successfully updated occurrence:", occurrence.id);
        }
    }

    console.log("createEvent completed successfully");
    return event;
}

export async function updateEvent(payload: ApiEvent): Promise<ApiEvent> {
    const res = await doApiRequest(`/api/events/${payload.id}/`, {
        method: "PUT",
        body: payload,
    });
    if (!res.ok) {
        const errorObj = Error(JSON.stringify(await res.json()));
        logException(errorObj, JSON.stringify(payload));
        throw errorObj;
    }
    return res.json();
}

export async function partialUpdateEvent(
    payload: Partial<ApiEvent>
): Promise<ApiEvent> {
    const res = await doApiRequest(`/api/events/${payload.id}/`, {
        method: "PATCH",
        body: payload,
    });
    if (!res.ok) {
        const errorObj = Error(JSON.stringify(await res.json()));
        logException(errorObj, JSON.stringify(payload));
        throw errorObj;
    }
    return res.json();
}

export async function deleteEvent(eventId: number) {
    const res = await doApiRequest(`/api/events/${eventId}/`, {
        method: "DELETE",
    });
    if (!res.ok) {
        const errorObj = Error(JSON.stringify(await res.json()));
        logException(errorObj, eventId);
        throw errorObj;
    }
}
