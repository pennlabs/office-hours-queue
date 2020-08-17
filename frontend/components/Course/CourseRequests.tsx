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

function makeResourceHook<P, R>(
    getUrl: (props: P) => string,
    initialData: R,
    method: string = "PATCH"
): (props: P) => [R, any, boolean, mutateResourceFunction<R>] {
    function useResource(
        props: P
    ): [R, any, boolean, mutateResourceFunction<R>] {
        const { data, error, isValidating, mutate } = useSWR(getUrl(props), {
            initialData,
        });
        const mutateWithAPI = async (newResource: Partial<R>) => {
            mutate({ ...data, ...newResource }, false);
            await doApiRequest(getUrl(props), {
                method,
                body: newResource,
            });
            return mutate();
        };
        return [data, error, isValidating, mutateWithAPI];
    }
    return useResource;
}

/**
 * Patch in an updated element in a list.
 * @param list list of elements, where elements have an `id` property.
 * @param id identifier to update
 * @param patch updated properties.
 */
function patchInList<T extends Identifiable>(
    list: T[],
    id: number,
    patch: Partial<T>
): T[] {
    for (let i = 0; i < list.length; i += 1) {
        const obj = list[i];
        // If the ID of this element matches the desired ID
        if (obj.id === id) {
            // Create a new object with updated properties.
            const newObj = { ...obj, ...patch };
            return [...list.slice(0, i), newObj, ...list.slice(i + 1)];
        }
    }
    // if no match exists, return the original list.
    return list;
}

function makeResourceListHook<P, R extends Identifiable>(
    getListUrl: (props: P) => string,
    getResourceUrl: (props: P & Identifiable) => string, // All props for the list, plus one for the resource.
    initialData: R[],
    method: string = "PATCH"
): (props: P) => [R[], any, boolean, mutateResourceListFunction<R>] {
    function useResourceList(
        props: P
    ): [R[], any, boolean, mutateResourceListFunction<R>] {
        const { data, error, isValidating, mutate } = useSWR(
            getListUrl(props),
            {
                initialData,
            }
        );
        const mutateWithAPI = async (
            id?: number,
            patchedResource?: Partial<R>
        ) => {
            mutate(patchInList(data, id, patchedResource), false);
            await doApiRequest(getResourceUrl({ ...props, id }), {
                method,
                body: patchedResource,
            });
            return mutate();
        };
        return [data, error, isValidating, mutateWithAPI];
    }
    return useResourceList;
}

export function useCourse(
    courseId: string,
    initalCourse: any
): [
    Course,
    any,
    boolean,
    (data?: any, shouldRevalidate?: boolean) => Promise<any>
] {
    const {
        data,
        error,
        isValidating,
        mutate,
    } = useSWR(`/courses/${courseId}/`, { initialData: initalCourse });
    return [data, error, isValidating, mutate];
}

export function useMembers(
    courseId: string,
    initialData: Membership[] = []
): [Membership[], any, boolean, mutateFunction<Membership[]>] {
    const {
        data,
        error,
        isValidating,
        mutate,
    } = useSWR(`/courses/${courseId}/members/`, { initialData });
    const members: Membership[] = data || [];
    return [members, error, isValidating, mutate];
}

export function useInvitedMembers(
    courseId: string,
    initialData: MembershipInvite[] = []
): [MembershipInvite[], any, boolean, mutateFunction<MembershipInvite[]>] {
    const {
        data,
        error,
        isValidating,
        mutate,
    } = useSWR(`/courses/${courseId}/invites/`, { initialData });
    const invitedMembers: MembershipInvite[] = data || [];
    return [invitedMembers, error, isValidating, mutate];
}

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
    initialData: Membership[] = []
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

export async function changeRole(
    courseId: number,
    membershipId: number,
    kind: string
) {
    const payload = { kind };
    const res = await doApiRequest(
        `/courses/${courseId}/members/${membershipId}/`,
        {
            method: "PATCH",
            body: payload,
        }
    );

    if (!res.ok) {
        throw new Error("Could not update membership");
    }
}

export async function deleteMembership(courseId: number, membershipId: number) {
    const res = await doApiRequest(
        `/courses/${courseId}/members/${membershipId}/`,
        {
            method: "DELETE",
        }
    );

    if (!res.ok) {
        throw new Error("Could not delete membership");
    }
}

export async function deleteInvite(courseId: string, inviteId: string) {
    const res = await doApiRequest(
        `/courses/${courseId}/invites/${inviteId}/`,
        {
            method: "DELETE",
        }
    );

    if (!res.ok) {
        throw new Error("Could not delete invite");
    }
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

export async function updateCourse(courseId: string, payload: Partial<Course>) {
    const res = await doApiRequest(`/courses/${courseId}/`, {
        method: "PATCH",
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
