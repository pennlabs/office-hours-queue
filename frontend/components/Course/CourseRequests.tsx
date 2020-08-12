import useSWR from "swr";
import getCsrf from "../../csrf";
import { Course } from "../../types"

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


export function getCourse(courseId: string, initalCourse: any): [
    Course,
    any,
    boolean,
    (data: any, shouldRevalidate: boolean) => Promise<any>
] {
    const { data, error, isValidating, mutate } = useSWR('/api/courses/' + courseId + '/', { initialData: initalCourse });
    const course = parseCourse(data);
    return [course, error, isValidating, mutate];
}
