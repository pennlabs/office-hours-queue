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

export interface User {
    firstName: string;
    lastName: string;
    email: string;
    smsNotificationsEnabled: boolean;
    smsVerified: boolean;
    phoneNumber?: string;
}
