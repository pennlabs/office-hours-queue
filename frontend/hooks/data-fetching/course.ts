import { useEffect } from "react";
import { mutate as globalMutate } from "swr";
import { useRealtimeResourceList } from "@pennlabs/rest-live-hooks";
import { useResourceList, useResource } from "@pennlabs/rest-hooks";
import {
    Announcement,
    Course,
    Kind,
    Membership,
    MembershipInvite,
    Question,
    Queue,
    Semester,
    Tag,
    User,
    QuestionStatus,
} from "../../types";
import { isLeadershipRole } from "../../utils/enums";
import { doApiRequest } from "../../utils/fetch";
import {
    QUEUE_STATUS_POLL_INTERVAL,
    STAFF_QUESTION_POLL_INTERVAL,
    STUDENT_QUESTION_POS_POLL_INTERVAL,
    ANNOUNCEMENTS_POLL_INTERVAL,
    STUDENT_QUOTA_POLL_INTERVAL,
} from "../../constants";

export const useCourse = (courseId: number, initialData?: Course) =>
    useResource(`/api/courses/${courseId}/`, {
        initialData,
    });

export const useTags = (courseId: number, initialData: Tag[]) =>
    useResourceList(
        `/api/courses/${courseId}/tags/`,
        (id) => `/api/courses/${courseId}/tags/${id}/`,
        {
            initialData,
            revalidateOnFocus: false,
        }
    );

export const useMembers = (courseId: number, initialData: Membership[]) =>
    useResourceList(
        `/api/courses/${courseId}/members/`,
        (id) => `/api/courses/${courseId}/members/${id}/`,
        { initialData }
    );

export const useInvitedMembers = (
    courseId: number,
    initialData: MembershipInvite[]
) =>
    useResourceList(
        `/api/courses/${courseId}/invites/`,
        (id) => `/api/courses/${courseId}/invites/${id}/`,
        { initialData }
    );

export function useStaff(courseId: number, initialUser: User) {
    const { data, error, isValidating, mutate } = useResource(
        "/api/accounts/me/",
        {
            initialData: initialUser,
        }
    );

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
    return { leader, staff, error, isValidating, mutate };
}

export function useLeadership(courseId: number, initialData: Membership[]) {
    const { data, error, isValidating, mutate } = useResource(
        `/api/courses/${courseId}/members/`,
        { initialData }
    );
    const leadership: Membership[] = (data || []).filter((mem) =>
        isLeadershipRole(mem.kind)
    );
    return { leadership, error, isValidating, mutate };
}

export async function sendMassInvites(
    courseId: number,
    emails: string,
    kind: string
) {
    const payload = { emails, kind };

    const res = await doApiRequest(`/api/courses/${courseId}/mass-invite/`, {
        method: "POST",
        body: payload,
    });

    if (!res.ok) {
        const error = await res.json();
        throw {
            payload: JSON.stringify(payload),
            error: JSON.stringify(error),
        };
    }
}

export async function getSemesters(): Promise<Semester[]> {
    return doApiRequest("/api/semesters/")
        .then((res) => res.json())
        .catch((_) => []);
}

export async function createTag(courseId: number, name: string): Promise<Tag> {
    const payload = { name };

    return doApiRequest(`/api/courses/${courseId}/tags/`, {
        method: "POST",
        body: payload,
    })
        .then((res) => res.json())
        .catch((_) => null);
}

export const useQueues = (courseId: number, initialData: Queue[]) =>
    useResourceList<Queue>(
        `/api/courses/${courseId}/queues/`,
        (id) => `/api/courses/${courseId}/queues/${id}/`,
        {
            initialData,
            refreshInterval: QUEUE_STATUS_POLL_INTERVAL,
        }
    );

// NOTE: Only call this when queue has rate limiting turned on
export const useQueueQuota = (courseId: number, queueId: number) => {
    const { data: qdata } = useRealtimeResourceList<Question, "queue_id">(
        `/api/courses/${courseId}/queues/${queueId}/questions/`,
        (id) => `/api/courses/${courseId}/queues/${queueId}/questions/${id}/`,
        {
            model: "ohq.Question",
            view_kwargs: {
                course_pk: courseId,
                queue_pk: queueId,
            },
        }
    );

    const { data, mutate } = useResource<{
        count: number;
        // Lint tradeoff between python and JS
        // eslint-disable-next-line
        wait_time_mins: number;
    }>(`/api/courses/${courseId}/queues/${queueId}/questions/quota_count/`, {
        refreshInterval: STUDENT_QUOTA_POLL_INTERVAL,
    });

    const stringified = JSON.stringify(qdata);

    // this revalidates the last question query whenever there is a websocket update
    useEffect(() => {
        mutate(undefined, { sendRequest: false });
    }, [stringified]);

    return { data };
};

export const useQuestions = (
    courseId: number,
    queueId: number,
    initialData: Question[]
) => {
    const { data, ...other } = useRealtimeResourceList(
        `/api/courses/${courseId}/queues/${queueId}/questions/`,
        (id) => `/api/courses/${courseId}/queues/${queueId}/questions/${id}/`,
        {
            model: "ohq.Question",
            view_kwargs: {
                course_pk: courseId,
                queue_pk: queueId,
            },
        },
        {
            initialData,
            refreshInterval: STAFF_QUESTION_POLL_INTERVAL,
            orderBy: (q1, q2) => {
                const date1 = new Date(q1.timeAsked);
                const date2 = new Date(q2.timeAsked);

                if (date1 > date2) {
                    return 1;
                } else {
                    return -1;
                }
            },
        }
    );
    const filteredData = data?.filter(
        (q) =>
            q.status === QuestionStatus.ACTIVE ||
            q.status === QuestionStatus.ASKED
    );
    return { data: filteredData, ...other };
};

export const useQuestionPosition = (
    courseId: number,
    queueId: number,
    id: number
) => {
    const { data, error, isValidating, mutate } = useResource(
        `/api/courses/${courseId}/queues/${queueId}/questions/${id}/position/`,
        {
            initialData: {
                position: -1,
            },
            refreshInterval: STUDENT_QUESTION_POS_POLL_INTERVAL,
        }
    );

    return { data, error, isValidating, mutate };
};

// only student queues should use this, since it doesn't make
// much sense otherwise
export const useLastQuestions = (courseId: number, queueId: number) => {
    const { data: qdata } = useRealtimeResourceList<Question, "queue_id">(
        `/api/courses/${courseId}/queues/${queueId}/questions/`,
        (id) => `/api/courses/${courseId}/queues/${queueId}/questions/${id}/`,
        {
            model: "ohq.Question",
            view_kwargs: {
                course_pk: courseId,
                queue_pk: queueId,
            },
        }
    );

    const { data, error, isValidating, mutate } = useResourceList<Question>(
        `/api/courses/${courseId}/queues/${queueId}/questions/last/`,
        (id) => `/courses/${courseId}/queues/${queueId}/last/${id}/`
    );

    const stringified = JSON.stringify(qdata);

    // this revalidates the last question query whenever there is a websocket update
    useEffect(() => {
        mutate(-1, null);
    }, [stringified]);

    return { data, error, isValidating, mutate };
};

export const useAnnouncements = (
    courseId: number,
    initialData: Announcement[]
) =>
    useResourceList(
        `/api/courses/${courseId}/announcements/`,
        (id) => `/api/courses/${courseId}/announcements/${id}/`,
        {
            initialData,
            refreshInterval: ANNOUNCEMENTS_POLL_INTERVAL,
        }
    );

export async function createAnnouncement(
    courseId: number,
    payload: { content: string }
) {
    const res = await doApiRequest(`/api/courses/${courseId}/announcements/`, {
        method: "POST",
        body: payload,
    });
    if (!res.ok) {
        const error = await res.json();
        throw {
            payload: JSON.stringify(payload),
            error: JSON.stringify(error),
        };
    }
}

export async function clearQueue(courseId: number, queueId: number) {
    await doApiRequest(`/api/courses/${courseId}/queues/${queueId}/clear/`, {
        method: "POST",
    });
    return globalMutate(`/courses/${courseId}/queues/${queueId}/`);
}

export async function createQuestion(
    courseId: number,
    queueId: number,
    payload: Partial<Omit<Question, "tags"> & { tags: Partial<Tag>[] }>
): Promise<void> {
    const res = await doApiRequest(
        `/api/courses/${courseId}/queues/${queueId}/questions/`,
        {
            method: "POST",
            body: payload,
        }
    );

    if (!res.ok) {
        const error = await res.json();
        throw {
            payload: JSON.stringify(payload),
            error: JSON.stringify(error),
        };
    }
}

export async function createQueue(
    courseId: number,
    payload: Partial<Queue>
): Promise<void> {
    const res = await doApiRequest(`/api/courses/${courseId}/queues/`, {
        method: "POST",
        body: payload,
    });

    if (!res.ok) {
        const error = await res.json();
        throw {
            payload: JSON.stringify(payload),
            error: JSON.stringify(error),
        };
    }
}

export async function finishQuestion(
    courseId: number,
    queueId: number,
    questionId: number
): Promise<void> {
    const payload = { status: QuestionStatus.ANSWERED };
    const res = await doApiRequest(
        `/api/courses/${courseId}/queues/${queueId}/questions/${questionId}/`,
        {
            method: "PATCH",
            body: payload,
        }
    );

    if (!res.ok) {
        const error = await res.json();
        throw {
            payload: JSON.stringify(payload),
            error: JSON.stringify(error),
        };
    }
}
