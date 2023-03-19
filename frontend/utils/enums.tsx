import { Kind, QuestionStatus } from "../types";

export const roleOptions = [
    {
        key: 0,
        value: Kind.PROFESSOR,
        text: "Professor",
    },
    {
        key: 1,
        value: Kind.HEAD_TA,
        text: "Head TA",
    },
    {
        key: 2,
        value: Kind.TA,
        text: "TA",
    },
    {
        key: 3,
        value: Kind.STUDENT,
        text: "Student",
    },
];

export const staffRoleOptions = [
    {
        key: 0,
        value: Kind.PROFESSOR,
        text: "Professor",
    },
    {
        key: 1,
        value: Kind.HEAD_TA,
        text: "Head TA",
    },
    {
        key: 2,
        value: Kind.TA,
        text: "TA",
    },
];

export function prettifyRole(role: Kind) {
    const optObj = roleOptions.find((o) => o.value === role);
    if (!optObj) {
        throw new Error("invariant broken");
    }
    return optObj.text;
}

export function isLeadershipRole(role: Kind) {
    return ["PROFESSOR", "HEAD_TA"].indexOf(role) >= 0;
}

export const questionStateOptions = [
    {
        key: 0,
        value: "ASKED",
        text: "Asked",
    },
    {
        key: 1,
        value: "WITHDRAWN",
        text: "Withdrawn",
    },
    {
        key: 2,
        value: "ACTIVE",
        text: "Active",
    },
    {
        key: 3,
        value: "REJECTED",
        text: "Rejected",
    },
    {
        key: 4,
        value: "ANSWERED",
        text: "Answered",
    },
];

export function prettifyQuestionState(state: QuestionStatus) {
    const optObj = questionStateOptions.find((o) => o.value === state);
    if (!optObj) {
        throw new Error("invariant broken");
    }
    return optObj.text;
}
