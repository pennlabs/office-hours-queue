import useSWR from "swr";
import getCsrf from "../../csrf";
import { Course, Membership, MembershipInvite } from "../../types";

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
    courseId: string
): [
    Membership[],
    any,
    boolean,
    (data?: any, shouldRevalidate?: boolean) => Promise<any>
] {
    const {
        data,
        error,
        isValidating,
        mutate,
    } = useSWR(`/api/courses/${courseId}/members/`, { initialData: [] });
    const members: Membership[] = data || [];
    return [members, error, isValidating, mutate];
}

export function useInvitedMembers(
    courseId: string
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
    } = useSWR(`/api/courses/${courseId}/invites/`, { initialData: [] });
    const invitedMembers: MembershipInvite[] = data || [];
    return [invitedMembers, error, isValidating, mutate];
}
