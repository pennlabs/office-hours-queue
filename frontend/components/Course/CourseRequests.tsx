import useSWR from "swr";
import { Course, Membership, MembershipInvite, Semester } from "../../types";
import { isLeadershipRole } from "../../utils/enums";
import { doApiRequest } from "../../utils/fetch";

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
    memberships: any
): [
    Membership[],
    any,
    boolean,
    (data?: any, shouldRevalidate?: boolean) => Promise<any>
] {
    const { data, error, isValidating, mutate } = useSWR(
        `/courses/${courseId}/members/`,
        {
            initialData: memberships,
        }
    );
    const members: Membership[] = data || [];
    return [members, error, isValidating, mutate];
}

export function useInvitedMembers(
    courseId: string,
    invites: any
): [
    MembershipInvite[],
    any,
    boolean,
    (data?: any, shouldRevalidate?: boolean) => Promise<any>
] {
    const {
        data,
        error,
        isValidating,
        mutate,
    } = useSWR(`/courses/${courseId}/invites/`, { initialData: invites });
    const invitedMembers: MembershipInvite[] = data || [];
    return [invitedMembers, error, isValidating, mutate];
}

export function useLeader(
    courseId: string,
    initialUser: any
): [
    boolean,
    any,
    boolean,
    (data?: any, shouldRevalidate?: boolean) => Promise<any>
] {
    const { data, error, isValidating, mutate } = useSWR(`/accounts/me/`, {
        initialData: initialUser,
    });
    const course = data.membershipSet.find(
        (membership) => membership.course.id === courseId
    );
    const leader = isLeadershipRole(course.kind);
    return [leader, error, isValidating, mutate];
}

export function useLeadership(
    courseId: string,
    memberships: any
): [
    Membership[],
    any,
    boolean,
    (data?: any, shouldRevalidate?: boolean) => Promise<any>
] {
    const { data, error, isValidating, mutate } = useSWR(
        `/courses/${courseId}/leadership/`,
        {
            initialData: memberships,
        }
    );
    const leadership: Membership[] = data || [];
    return [leadership, error, isValidating, mutate];
}

export async function changeRole(
    courseId: string,
    membershipId: string,
    kind: string
) {
    const payload = {
        kind: kind,
    };
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

export async function deleteMembership(courseId: string, membershipId: string) {
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
    courseId: string,
    emails: string,
    kind: string
) {
    const payload = {
        emails: emails,
        kind: kind,
    };

    const res = await doApiRequest(`/courses/${courseId}/mass-invite/`, {
        method: "POST",
        body: payload,
    });

    if (!res.ok) {
        throw new Error("Could not send invites");
    }
}

export async function updateCourse(courseId: string, payload: any) {
    const res = await doApiRequest(`/courses/${courseId}/`, {
        method: "PATCH",
        body: payload,
    });

    if (!res.ok) {
        throw new Error("Could not send invites");
    }
}

export async function getSemesters(): Promise<Semester[]> {
    return await doApiRequest("/semesters/")
        .then((res) => res.json())
        .catch((_) => []);
}
