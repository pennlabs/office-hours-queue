import useSWR from "swr";
import getCsrf from "../../csrf";
import { Course, Membership, MembershipInvite } from "../../types";
import { isLeadershipRole } from "../../utils/enums";

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
    } = useSWR(`/api/courses/${courseId}/`, { initialData: initalCourse });
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
        `/api/courses/${courseId}/members/`,
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
    } = useSWR(`/api/courses/${courseId}/invites/`, { initialData: invites });
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
    const { data, error, isValidating, mutate } = useSWR(`/api/accounts/me/`, {
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
        `/api/courses/${courseId}/leadership/`,
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
    const res = await fetch(
        `/api/courses/${courseId}/members/${membershipId}/`,
        {
            method: "PATCH",
            credentials: "include",
            mode: "same-origin",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRFToken": getCsrf(),
            },
            body: JSON.stringify(payload),
        }
    );

    if (!res.ok) {
        throw new Error("Could not update membership");
    }
}

export async function deleteMembership(courseId: string, membershipId: string) {
    const res = await fetch(
        `/api/courses/${courseId}/members/${membershipId}/`,
        {
            method: "DELETE",
            credentials: "include",
            mode: "same-origin",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRFToken": getCsrf(),
            },
        }
    );

    if (!res.ok) {
        throw new Error("Could not delete membership");
    }
}

export async function deleteInvite(courseId: string, inviteId: string) {
    const res = await fetch(`/api/courses/${courseId}/invites/${inviteId}/`, {
        method: "DELETE",
        credentials: "include",
        mode: "same-origin",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrf(),
        },
    });

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

    const res = await fetch(`/api/courses/${courseId}/mass-invite/`, {
        method: "POST",
        credentials: "include",
        mode: "same-origin",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrf(),
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error("Could not send invites");
    }
}
