import useSWR from "swr";

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
        semester: course.semester,
        archived: course.archived,
        inviteOnly: course.invite_only,
        videChatEnabled: course.video_chat_enabled,
        requireVideoChatUrlOnQuestions: course.require_video_chat_url_on_questions,
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

    return [memberships, error, isValidating, mutate]
}
