export interface Course {
    id: number;
    courseCode: string;
    department: string;
    courseTitle: string;
    description: string;
    semester: number;
    semesterPretty: string;
    archived: boolean;
    inviteOnly: boolean;
    videChatEnabled: boolean;
    requireVideoChatUrlOnQuestions: boolean;
    isMember: boolean;
}

export interface CourseUser {
    firstName: string;
    lastName: string;
    email: string;
}

export interface Membership {
    id: number;
    kind: string;
    course?: Course;
    user?: CourseUser;
}

export interface MembershipInvite {
    id: number;
    kind: string;
    email: string;
}

export interface User {
    firstName: string;
    lastName: string;
    email: string;
    smsNotificationsEnabled: boolean;
    smsVerified: boolean;
    phoneNumber?: string;
}

export interface Question {
    text: string;
    videoChatUrl: string;
    timeAsked: Date;
    askedBy: CourseUser;
    answeredBy: CourseUser;
    rejectedBy: CourseUser;
    rejectedReason: string | null;
}
