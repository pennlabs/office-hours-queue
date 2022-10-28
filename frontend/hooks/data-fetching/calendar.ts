import { useResourceList } from "@pennlabs/rest-hooks";

import { Event, PartialEvent } from "../../types";
import { doApiRequest } from "../../utils/fetch";
import { logException } from "../../utils/sentry";

export const useEvents = (courseId: number, initialData: Event[]) =>
    useResourceList(
        `/api/events/?course=${courseId}`,
        (id) => `/api/events/${id}/`,
        {
            initialData,
        }
    );

export async function createEvent(payload: PartialEvent): Promise<Event> {
    console.log(payload);
    const res = await doApiRequest(`/api/events/`, {
        method: "POST",
        body: payload,
    });
    if (!res.ok) {
        const error = await res.json();
        const errorObj = Error(JSON.stringify(error));
        logException(errorObj, JSON.stringify(payload));
        throw errorObj;
    }
    const data: Event = await res.json();
    return data;
}
