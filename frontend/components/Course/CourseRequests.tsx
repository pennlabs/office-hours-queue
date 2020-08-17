import useSWR from "swr";
import { isLeadershipRole } from "../../utils/enums";
import { doApiRequest } from "../../utils/fetch";
import {
    Course,
    Membership,
    MembershipInvite,
    mutateFunction,
    Question,
    Queue,
    User,
    Semester,
    mutateResourceFunction,
    Identifiable,
    mutateResourceListFunction,
} from "../../types";

function useResource<R>(
    url: string,
    initialData?: R
): [R, any, boolean, mutateResourceFunction<R>] {
    const { data, error, isValidating, mutate } = useSWR(url, {
        initialData,
    });
    const mutateWithAPI = async (
        newResource: Partial<R>,
        method: string = "PATCH"
    ) => {
        mutate({ ...data, ...newResource }, false);
        await doApiRequest(url, {
            method,
            body: newResource,
        });
        return mutate();
    };
    return [data, error, isValidating, mutateWithAPI];
}

/**
 * Patch in an updated element in a list.
 * @param list list of elements, where elements have an `id` property.
 * @param id identifier to update
 * @param patch updated properties. If null, delete from list.
 */
function patchInList<T extends Identifiable>(
    list: T[],
    id: number,
    patch: Partial<T> | null
): [T[], boolean] {
    for (let i = 0; i < list.length; i += 1) {
        const obj = list[i];
        // If the ID of this element matches the desired ID
        if (obj.id === id) {
            if (patch === null) {
                return [[...list.slice(0, i), ...list.slice(i + 1)], true];
            }
            const newObj = { ...obj, ...patch };
            return [[...list.slice(0, i), newObj, ...list.slice(i + 1)], true];
        }
    }
    // if no match exists, return the original list.
    return [list, false];
}

function useResourceList<P, R extends Identifiable>(
    listUrl: string | (() => string),
    getResourceUrl: (id: number) => string,
    initialData?: R[]
): [R[], any, boolean, mutateResourceListFunction<R>] {
    const { data, error, isValidating, mutate } = useSWR(listUrl, {
        initialData,
    });
    const mutateWithAPI = async (
        id: number,
        patchedResource: Partial<R> | null,
        method: string = "PATCH"
    ) => {
        const [patchedList, didPatch] = patchInList(data, id, patchedResource);
        if (didPatch) {
            // Only perform an API request when the patch finds a matching entry.
            mutate(patchedList, false);
            await doApiRequest(getResourceUrl(id), {
                method,
                body: patchedResource,
            });
        }
        // Always revalidate, even if mutate was a no-op.
        return mutate();
    };
    return [data, error, isValidating, mutateWithAPI];
}

export const useCourse = (courseId: number, initialCourse: Course) =>
    useResource(`/courses/${courseId}/`, initialCourse);

export const useMembers = (courseId: number, initialData: Membership[]) =>
    useResourceList(
        `/courses/${courseId}/members/`,
        (id) => `/courses/${courseId}/members/${id}/`,
        initialData
    );

export const useInvitedMembers = (
    courseId: number,
    initialData: MembershipInvite[]
) =>
    useResourceList(
        `/courses/${courseId}/invites/`,
        (id) => `/courses/${courseId}/members/${id}/`,
        initialData
    );

export function useStaff(
    courseId: number,
    initialUser: User
): [boolean, boolean, any, boolean, mutateFunction<User>] {
    const { data, error, isValidating, mutate } = useSWR("/accounts/me/", {
        initialData: initialUser,
    });
    const course = data.membershipSet.find(
        (membership) => membership.course.id === courseId
    );
    const leader = isLeadershipRole(course.kind);
    const staff = course.kind !== "STUDENT";
    return [leader, staff, error, isValidating, mutate];
}

export function useLeadership(
    courseId: number,
    initialData: Membership[]
): [Membership[], any, boolean, mutateFunction<Membership[]>] {
    const {
        data,
        error,
        isValidating,
        mutate,
    } = useSWR(`/courses/${courseId}/leadership/`, { initialData });
    const leadership: Membership[] = data || [];
    return [leadership, error, isValidating, mutate];
}

export async function sendMassInvites(
    courseId: number,
    emails: string,
    kind: string
) {
    const payload = { emails, kind };

    const res = await doApiRequest(`/courses/${courseId}/mass-invite/`, {
        method: "POST",
        body: payload,
    });

    if (!res.ok) {
        throw new Error("Could not send invites");
    }
}

export async function getSemesters(): Promise<Semester[]> {
    return doApiRequest("/semesters/")
        .then((res) => res.json())
        .catch((_) => []);
}

export function useQueues(
    courseId: number,
    initialData: Queue[] = []
): [Queue[], any, boolean, mutateFunction<Queue[]>] {
    const {
        data,
        error,
        isValidating,
        mutate,
    } = useSWR(`/courses/${courseId}/queues/`, { initialData });
    return [data, error, isValidating, mutate];
}

export function useQuestions(
    courseId: number,
    queueId: number,
    refreshInterval: number,
    initialData: Question[] = []
): [Question[], any, boolean, mutateFunction<Question[]>] {
    const { data, error, isValidating, mutate } = useSWR(
        `/courses/${courseId}/queues/${queueId}/questions/`,
        {
            initialData,
            refreshInterval,
        }
    );
    return [data, error, isValidating, mutate];
}

export async function updateQueue(
    courseId: number,
    queueId: number,
    queue: Partial<Queue>
) {
    return doApiRequest(`/courses/${courseId}/queues/${queueId}/`, {
        method: "PATCH",
        body: { ...queue },
    });
}

export async function clearQueue(courseId: number, queueId: number) {
    return doApiRequest(`/courses/${courseId}/queues/${queueId}/clear/`, {
        method: "POST",
    });
}

export async function updateQuestion(
    courseId: number,
    queueId: number,
    questionId: number,
    question: Partial<Question>
) {
    return doApiRequest(
        `/courses/${courseId}/queues/${queueId}/questions/${questionId}/`,
        {
            method: "PATCH",
            body: { ...question },
        }
    );
}
