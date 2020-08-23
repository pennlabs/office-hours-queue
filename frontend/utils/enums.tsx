export const roleOptions = [
    {
        key: 0,
        value: "PROFESSOR",
        text: "Professor",
    },
    {
        key: 1,
        value: "HEAD_TA",
        text: "Head TA",
    },
    {
        key: 2,
        value: "TA",
        text: "TA",
    },
    {
        key: 3,
        value: "STUDENT",
        text: "Student",
    },
];

export const staffRoleOptions = [
    {
        key: 0,
        value: "PROFESSOR",
        text: "Professor",
    },
    {
        key: 1,
        value: "HEAD_TA",
        text: "Head TA",
    },
    {
        key: 2,
        value: "TA",
        text: "TA",
    },
];

export function prettifyRole(role) {
    return roleOptions.find((o) => o.value === role).text;
}

export function isLeadershipRole(role) {
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

export function prettifyQuestionState(state) {
    return questionStateOptions.find((o) => o.value === state).text;
}
