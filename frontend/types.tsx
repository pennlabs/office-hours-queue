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

export interface BaseUser {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface Membership {
    id: number;
    kind: Kind;
    user: BaseUser;
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

export interface UserMembership {
    id: number;
    course: Course;
    kind: Kind;
}

export interface User extends BaseUser {
    id: number;
    profile: Profile;
    membershipSet: UserMembership[];
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
    videoChatUrl?: string;
    status: QuestionStatus;
    timeAsked: string;
    askedBy: User;
    respondedToBy?: User;
    rejectedReason: string | null;
    timeResponseStarted?: string;
    timeRespondedTo?: string;
    shouldSendUpSoonNotification: boolean;
    tags?: Tag[];
    // this is a marker field for subscribe requests
    // it should never have a value
    // eslint-disable-next-line
    queue_id: undefined;
}

export interface Semester {
    id: number;
    term: string;
    pretty: string;
}

export interface Tag {
    id?: number;
    name: string;
}

export interface TagLabel {
    value: string;
    label: string;
}

export interface QuestionMap {
    [queueId: number]: Question[];
}

export type mutateFunction<D> = (
    data?: D,
    shouldRevalidate?: boolean
) => Promise<D | undefined>;

export interface Identifiable {
    id: number;
}

export type mutateResourceFunction<D> = (
    data?: Partial<D>,
    method?: string
) => Promise<D | undefined>;
export type mutateResourceListFunction<D extends Identifiable> = (
    id: number,
    data: Partial<D> | null,
    method?: string
) => Promise<D[] | undefined>;

export interface Toast {
    message: string;
    success: boolean;
}

export interface CoursePageProps {
    course: Course;
    leadership: Membership[];
}
