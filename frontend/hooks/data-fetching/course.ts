import useSWR, { mutate as globalMutate } from "swr";
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
    const course = data.membershipSet.find(
        (membership) => membership.course.id === courseId
    );
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
    useResourceList<Queue>(
        `/courses/${courseId}/queues/`,
        (id) => `/courses/${courseId}/queues/${id}/`,
        initialData
    );

export const useQuestions = (
    courseId: number,
    queueId: number,
    refreshInterval: number
) =>
    useResourceList<Question>(
        `/courses/${courseId}/queues/${queueId}/questions/`,
        (id) => `/courses/${courseId}/queues/${queueId}/questions/${id}/`,
        [],
        { refreshInterval }
    );

export const useQuestionPosition = (
    courseId: number,
    queueId: number,
    id: number,
    refreshInterval: number
) =>
    useResource(
        `/courses/${courseId}/queues/${queueId}/questions/${id}/position/`,
        { position: -1 },
        { refreshInterval }
    );

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
