import { MutableRefObject } from "react";

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
    kind: Kind;
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
    groups: string[];
}

export interface BaseQueue {
    id: number;
    course: number;
    name: string;
    description: string;
    questionTemplate: string;
    active: boolean;
    archived: boolean;
    estimatedWaitTime: number;
    questionsActive: number;
    questionsAsked: number;
    staffActive: number;
    videoChatSetting: VideoChatSetting;
    pinEnabled: boolean;
    pin?: string;
}

export enum VideoChatSetting {
    REQUIRED = "REQUIRED",
    OPTIONAL = "OPTIONAL",
    DISABLED = "DISABLED",
}

/* 
    Useful to scale the case where a property is only present when a flag is true for more than just "rateLimitEnabled"
*/
type ConditionalProperties<Flag extends string, Properties> =
    | { [K in Flag]: false } // Flag is false, no properties
    | ({ [K in Flag]: true } & Properties); // Flag is true, include properties

export type Queue = BaseQueue &
    ConditionalProperties<
        "rateLimitEnabled", // Conditional Flag
        {
            rateLimitLength: number; // Conditional Properties present when rateLimitEnabled is true
            rateLimitQuestions: number;
            rateLimitMinutes: number;
        }
    > &
    ConditionalProperties<
        "questionTimerEnabled",
        {
            questionTimerStartTime: number;
        }
    >;

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
    tags: Tag[];
    note: string;
    resolvedNote: boolean;
    studentDescriptor?: string;
    position: number;
    // this is a marker field for subscribe requests
    // it should never have a value
    // eslint-disable-next-line
    queue_id: undefined;
}

export interface Semester {
    id: number;
    term: string;
    year: number;
    pretty: string;
}

export interface Tag {
    id: number;
    name: string;
}

export interface Announcement {
    id: number;
    content: string;
    author: BaseUser;
    timeUpdated: string;
}

export interface QuestionMap {
    [queueId: number]: Question[];
}

export interface Toast {
    message: string;
    success: boolean;
}

export interface CoursePageProps {
    course: Course;
    leadership: Membership[];
}

export enum Metric {
    HEATMAP_WAIT = "HEATMAP_AVG_WAIT",
    HEATMAP_QUESTIONS = "HEATMAP_QUESTIONS_PER_TA",
    AVG_WAIT = "AVG_WAIT",
    NUM_ANSWERED = "NUM_ANSWERED",
    STUDENTS_HELPED = "STUDENTS_HELPED",
    AVG_TIME_HELPING = "AVG_TIME_HELPING",
    LIST_WAIT = "LIST_WAIT_TIME_DAYS",
}

interface HeatmapDataElem {
    metric: Metric;
    day: number;
    hour: number;
    value: string;
}

interface AnalyticsDataElem {
    metric: Metric;
    value: string;
    date: string;
}

export type HeatmapData = HeatmapDataElem[];
export type AnalyticsData = AnalyticsDataElem[];

export interface HeatmapSeries {
    name: string;
    data: { x: string; y: number }[];
}

export enum DayOfWeek {
    "Sunday" = 1,
    "Monday" = 2,
    "Tuesday" = 3,
    "Wednesday" = 4,
    "Thursday" = 5,
    "Friday" = 6,
    "Saturday" = 7,
}

export type NotificationProps = MutableRefObject<(string) => void>;

export interface ApiPartialEvent {
    title: string;
    course_id: number;
    description: string;
    start: string;
    end: string;
    location: string;
    rule?: { frequency: string; params: string } | null;
    end_recurring_period: string | null;
}

export interface ApiEvent extends ApiPartialEvent {
    id: number;
}

export interface Event {
    id: number;
    title: string;
    course_id: number;
    description: string;
    start: Date;
    end: Date;
    location: string;
    rule: { frequency: string; params: string } | null;
    end_recurring_period: Date | null;
}

export interface ApiOccurrence {
    id: number;
    title: string;
    description: string;
    start: string;
    end: string;
    location: string;
    cancelled: boolean;
    event: ApiEvent;
}

export interface Occurrence {
    id: number;
    title: string;
    description: string;
    start: Date;
    end: Date;
    location: string;
    cancelled: boolean;
    event: Event;
}
