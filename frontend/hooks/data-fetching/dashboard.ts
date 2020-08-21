import useSWR from "swr";
import { Course, Membership, mutateFunction } from "../../types";
import { doApiRequest } from "../../utils/fetch";

export async function getCourses(inputValue: string): Promise<Course[]> {
    return await doApiRequest(`/courses/?search=${inputValue}`)
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
): [
    Membership[],
    any,
    boolean,
    mutateFunction<Membership[]>
] {
    const { data, error, isValidating, mutate } = useSWR("/accounts/me/", {
        initialData: initialUser,
    });
    const memberships: Membership[] = data ? data.membershipSet : [];

    return [memberships, error, isValidating, mutate];
}
