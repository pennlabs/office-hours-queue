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
    videoChatEnabled: boolean;
    requireVideoChatUrlOnQuestions: boolean;
    isMember: boolean;
}

export interface Membership {
    id: number;
    kind: string;
    course?: Course;
    user?: User;
}

export interface MembershipInvite {
    id: number;
    kind: string;
    email: string;
}

export interface Profile {
    smsNotificationsEnabled: boolean;
    smsVerified: boolean;
    phoneNumber?: string;
}

export interface User {
    firstName: string;
    lastName: string;
    email: string;
    profile?: Profile;
    membershipSet?: Membership[];
}

export interface Queue {
    id: number;
    course: number;
    name: string;
    description: string;
    active: boolean;
    archived: boolean;
    estimatedWaitTime: number;
}

export interface Question {
    text: string;
    videoChatUrl: string;
    timeAsked: Date;
    askedBy: User;
    answeredBy: User;
    rejectedBy: User;
    rejectedReason: string | null;
}

export interface Semester {
    id: number;
    term: string;
    pretty: string;
}
export type mutateFunction<D> = (
    data?: D,
    shouldRevalidate?: boolean
) => Promise<D>;
