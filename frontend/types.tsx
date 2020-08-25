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

export enum Kind {
    STUDENT = "STUDENT",
    TA = "TA",
    HEAD_TA = "HEAD_TA",
    PROFESSOR = "PROFESSOR",
}

// TODO: why is user a nullable field here? How is user injected?
// Can we refactor so another type extends this?
export interface Membership {
    id: number;
    kind: Kind;
    course: Course;
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
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    profile: Profile;
    membershipSet: Membership[];
}

export interface Queue {
    id: number;
    course: number;
    name: string;
    description: string;
    active: boolean;
    archived: boolean;
    estimatedWaitTime: number;
    questionsActive: number;
    questionsAsked: number;
    staffActive: number;
}

// "ASKED" "WITHDRAWN" "ACTIVE" "REJECTED" "ANSWERED"
export enum QuestionStatus {
    ASKED = "ASKED",
    WITHDRAWN = "WITHDRAWN",
    ACTIVE = "ACTIVE",
    REJECTED = "REJECTED",
    ANSWERED = "ANSWERED",
}

export interface Question {
    id: number;
    text: string;
    videoChatUrl: string;
    status: QuestionStatus;
    timeAsked: Date;
    askedBy: User;
    respondedToBy: User;
    rejectedReason: string | null;
    timeResponseStarted: Date;
    timeRespondedTo: Date;
    position: number;
    shouldSendUpSoonNotification: boolean;
    tags?: string[];
}

export interface Semester {
    id: number;
    term: string;
    pretty: string;
}

export interface QuestionMap {
    [queueId: number]: Question[];
}

export type mutateFunction<D> = (
    data?: D,
    shouldRevalidate?: boolean
) => Promise<D>;

export interface Identifiable {
    id: number;
}

export type mutateResourceFunction<D> = (
    data?: Partial<D>,
    method?: string
) => Promise<D>;
export type mutateResourceListFunction<D extends Identifiable> = (
    id: number,
    data: Partial<D> | null,
    method?: string
) => Promise<D[]>;

export interface Toast {
    message: string;
    success: boolean;
}

export interface CoursePageProps {
    course: Course;
    leadership: Membership[];
}
