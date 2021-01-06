import useSWR from "swr";
import { Course, UserMembership, mutateFunction } from "../../types";
import { doApiRequest } from "../../utils/fetch";

export async function getCourses(inputValue: string): Promise<Course[]> {
    return doApiRequest(`/courses/?search=${inputValue}`)
        .then((res) => res.json())
        .then((res) => res.map((course) => course))
        .catch((_) => []);
}

export async function joinCourse(courseId: string): Promise<void> {
    const res = await doApiRequest(`/courses/${courseId}/members/`, {
        method: "POST",
    });

    if (!res.ok) {
        throw new Error("Unable to join course");
    }
}

export async function leaveCourse(
    courseId: string,
    membershipId: string
): Promise<void> {
    const res = await doApiRequest(
        `/courses/${courseId}/members/${membershipId}/`,
        {
            method: "DELETE",
        }
    );

    if (!res.ok) {
        throw new Error("Unable to leave course");
    }
}

export async function createCourse(payload: any): Promise<void> {
    const res = await doApiRequest("/courses/", {
        method: "POST",
        body: payload,
    });

    if (!res.ok) {
        throw new Error("Unable to create course");
    }
}

export function useMemberships(
    initialUser
): [UserMembership[], any, boolean, mutateFunction<UserMembership[]>] {
    const { data, error, isValidating, mutate } = useSWR("/accounts/me/", {
        initialData: initialUser,
    });
    const memberships: UserMembership[] = data ? data.membershipSet : [];

    return [memberships, error, isValidating, mutate];
}
