import useSWR from "swr";
import getCsrf from "../../../csrf";
import { Course, Membership } from "../../../types";
import { parseCourse } from "../../Course/CourseRequests";


export async function getCourses(inputValue: string): Promise<Course[]> {
    return await fetch(`/api/courses/?search=${inputValue}`)
        .then((res) => res.json())
        .then((res) => res.map((course) => parseCourse(course)))
        .catch((_) => []);
}

export async function joinCourse(courseId: string): Promise<void> {
    const res = await fetch(`/api/courses/${courseId}/members/`, {
        method: "POST",
        credentials: "include",
        mode: "same-origin",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrf(),
        },
        body: "",
    });
    if (!res.ok) {
        throw new Error("Unable to join course");
    }
}

export function getMemberships(
    initialUser
): [
        Membership[],
        any,
        boolean,
        (data: any, shouldRevalidate: boolean) => Promise<any>
    ] {
    const { data, error, isValidating, mutate } = useSWR("/api/accounts/me/", {
        initialData: initialUser,
    });
    const memberships: Membership[] = data
        ? data.membership_set.map((membership) => ({
            id: membership.id,
            kind: membership.kind,
            course: parseCourse(membership.course),
        }))
        : [];

    return [memberships, error, isValidating, mutate];
}
