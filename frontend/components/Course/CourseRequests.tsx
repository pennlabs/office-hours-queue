import useSWR from "swr";
import getCsrf from "../../csrf";
import { Course, Membership, CourseUser, MembershipInvite } from "../../types"

export function parseCourse(course): Course {
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
        requireVideoChatUrlOnQuestions:
            course.require_video_chat_url_on_questions,
        isMember: course.is_member,
    };
}

function parseCourseUser(user): CourseUser {
    return {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
    }
}

function parseMember(member): Membership {
    return {
        id: member.id,
        kind: member.kind,
        user: parseCourseUser(member.user),
    }
}

function parseInvitedMember(member): MembershipInvite {
    return {
        id: member.id,
        kind: member.kind,
        email: member.email,
    }
}

export function getCourse(courseId: string, initalCourse: any): [
    Course,
    any,
    boolean,
    (data?: any, shouldRevalidate?: boolean) => Promise<any>
] {
    const { data, error, isValidating, mutate } = useSWR('/api/courses/' + courseId + '/', { initialData: initalCourse });
    const course = parseCourse(data);
    return [course, error, isValidating, mutate];
}

export function getMembers(
    courseId: string
): [
        Membership[],
        any,
        boolean,
        (data?: any, shouldRevalidate?: boolean) => Promise<any>
    ] {
    const { data, error, isValidating, mutate } = useSWR('/api/courses/' + courseId + '/members/', { initialData: [] });
    const members: Membership[] = data ? data.map((member) => parseMember(member)) : [];
    return [members, error, isValidating, mutate];
}

export function getInvitedMembers(
    courseId: string
): [
        MembershipInvite[],
        any,
        boolean,
        (data?: any, shouldRevalidate?: boolean) => Promise<any>
    ] {
    const { data, error, isValidating, mutate } = useSWR('/api/courses/' + courseId + '/invites/', { initialData: [] });
    const invitedMembers: MembershipInvite[] = data ? data.map((member) => parseInvitedMember(member)) : [];
    return [invitedMembers, error, isValidating, mutate];
}
