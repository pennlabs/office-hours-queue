import { useEffect } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import {
    useRealtimeResourceList,
    useRealtimeResource,
} from "@pennlabs/rest-live-hooks";
// TODO: REMOVE THIS AS SOON AS WE REFACTOR
import { useResourceList as useResourceListNew } from "@pennlabs/rest-hooks";
import {
    Course,
    Kind,
    Membership,
    MembershipInvite,
    mutateFunction,
    Question,
    Queue,
    Semester,
    User,
} from "../../types";
import { isLeadershipRole } from "../../utils/enums";
import { doApiRequest } from "../../utils/fetch";
import { useResource, useResourceList } from "./resources";

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
        (id) => `/courses/${courseId}/invites/${id}/`,
        initialData
    );

export function useStaff(
    courseId: number,
    initialUser: User
): [boolean, boolean, any, boolean, mutateFunction<User>] {
    const { data, error, isValidating, mutate } = useSWR("/accounts/me/", {
        initialData: initialUser,
    });

    // data cannot be null because key does not change and
    // initialData is provided
    const course = data!.membershipSet.find(
        (membership) => membership.course.id === courseId
    );

    if (!course) {
        throw new Error("User does not belong in this class");
    }

    const leader = isLeadershipRole(course.kind);
    const staff = course.kind !== Kind.STUDENT;
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
    } = useSWR(`/courses/${courseId}/members/`, { initialData });
    const leadership: Membership[] = (data || []).filter((mem) =>
        isLeadershipRole(mem.kind)
    );
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

export const useQueues = (courseId: number, initialData: Queue[]) =>
    useResourceListNew<Queue>(
        `/courses/${courseId}/queues/`,
        (id) => `/courses/${courseId}/queues/${id}/`,
        { initialData }
    );

export const useQuestions = (
    courseId: number,
    queueId: number,
    initialData: Question[]
) =>
    useRealtimeResourceList(
        `/courses/${courseId}/queues/${queueId}/questions`,
        (id) => `/courses/${courseId}/queues/${queueId}/questions/${id}/`,
        {
            model: "ohq.Question",
            property: "queue_id",
            value: queueId,
        },
        { initialData }
    );

export const useQuestionPosition = (
    courseId: number,
    queueId: number,
    id: number
) => {
    const { data: qdata } = useRealtimeResource<Queue>(
        `/courses/${courseId}/queues/${queueId}/id`,
        {
            model: "ohq.Queue",
            property: "id",
            value: queueId,
        }
    );

    const [
        data,
        error,
        isValidating,
        mutate,
    ] = useResource(
        `/courses/${courseId}/queues/${queueId}/questions/${id}/position/`,
        { position: -1 }
    );

    const stringified = JSON.stringify(qdata);
    useEffect(() => {
        mutate();
    }, [mutate, stringified]);
    return [data, error, isValidating, mutate];
};

// only student queues should use this, since it doesn't make
// much sense otherwise
export const useLastQuestions = (courseId: number, queueId: number) => {
    const { data: qdata } = useRealtimeResourceList<Question, "queue_id">(
        `/courses/${courseId}/queues/${queueId}/questions`,
        (id) => `/courses/${courseId}/queues/${queueId}/questions/${id}`,
        {
            model: "ohq.Question",
            property: "queue_id",
            value: queueId,
        }
    );

    const [data, error, isValidating, mutate] = useResourceList(
        `/courses/${courseId}/queues/${queueId}/questions/last/`,
        (id) => `/courses/${courseId}/queues/${queueId}/last/${id}/`
    );

    const stringified = JSON.stringify(qdata);

    // this revalidates the last question query whenever there is a websocket update
    useEffect(() => {
        mutate(-1, null);
    }, [mutate, stringified]);

    return [data, error, isValidating, mutate];
};

export async function clearQueue(courseId: number, queueId: number) {
    await doApiRequest(`/courses/${courseId}/queues/${queueId}/clear/`, {
        method: "POST",
    });
    return globalMutate(`/courses/${courseId}/queues/${queueId}/`);
}

export async function createQuestion(
    courseId: number,
    queueId: number,
    payload: Partial<Question>
): Promise<void> {
    const res = await doApiRequest(
        `/courses/${courseId}/queues/${queueId}/questions/`,
        {
            method: "POST",
            body: payload,
        }
    );

    if (!res.ok) {
        throw new Error("Unable to create question");
    }
}

export async function createQueue(
    courseId: number,
    payload: Partial<Queue>
): Promise<void> {
    const res = await doApiRequest(`/courses/${courseId}/queues/`, {
        method: "POST",
        body: payload,
    });

    if (!res.ok) {
        throw new Error("Unable to create queue");
    }
}
