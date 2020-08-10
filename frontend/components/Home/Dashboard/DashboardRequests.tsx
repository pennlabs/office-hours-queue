import useSWR from "swr";
import getCsrf from "../../../csrf";

export interface Course {
    id: number;
    courseCode: string;
    department: string;
    courseTitle: string;
    description: string;
    semester: string;
    archived: boolean;
    inviteOnly: boolean;
    videChatEnabled: boolean;
    requireVideoChatUrlOnQuestions: boolean;
    isMember: boolean;
}

export interface Membership {
    id: number;
    kind: string;
    course: Course;
}

function getCourse(course): Course {
    return {
        id: course.id,
        courseCode: course.course_code,
        department: course.department,
        courseTitle: course.course_title,
        description: course.description,
        semester: course.semester_pretty,
        archived: course.archived,
        inviteOnly: course.invite_only,
        videChatEnabled: course.video_chat_enabled,
        requireVideoChatUrlOnQuestions: course.require_video_chat_url_on_questions,
        isMember: course.is_member,
    };
}

export async function getCourses(inputValue: string): Promise<Course[]> {
    return await fetch(`/api/courses/?search=${inputValue}`)
        .then((res) => res.json())
        .then((res) => res.map((course) => getCourse(course)))
        .catch((_ => []));
}

export async function joinCourse(courseId: string): Promise<void> {
    let res = await fetch(`/api/courses/${courseId}/members/`, {
        method: "POST",
        credentials: "include",
        mode: "same-origin",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrf(),
        },
        body: "",
    })
    if (!res.ok) {
        throw new Error("Unable to join course");
    }
}

export function getMemberships(initialUser): [Membership[], any, any, any] {
    const { data, error, isValidating, mutate } = useSWR("/api/accounts/me/", {
        initialData: initialUser,
    });
    const memberships: Membership[] = data
        ? data.membership_set.map((membership) => (
            {
                id: membership.id,
                kind: membership.kind,
                course: getCourse(membership.course),
            }
        ))
        : [];

    return [memberships, error, isValidating, mutate];
}
