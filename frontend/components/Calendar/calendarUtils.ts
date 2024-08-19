import { SemanticCOLORS } from "semantic-ui-react";
import { Kind, UserMembership } from "../../types";

export const eventColors: SemanticCOLORS[] = [
    "red",
    "olive",
    "teal",
    "pink",
    "orange",
    "green",
    "violet",
    "brown",
    "yellow",
    "purple",
    "grey",
];

// SemanticCOLORS in hex
export const eventColorsHex = {
    red: "#DB2828",
    olive: "#B5CC18",
    teal: "#00B5AD",
    pink: "#E03997",
    orange: "#F2711C",
    green: "#21BA45",
    violet: "#6435C9",
    brown: "#A5673F",
    yellow: "#FBBD08",
    purple: "#A333C8",
    grey: "#767676",
    blue: "#2185D0",
};

export const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

export const filterSortMemberships = (memberships: UserMembership[]) =>
    memberships
        .filter((m) => !m.course.archived)
        .sort((a, b) => {
            if (a.kind === Kind.STUDENT && b.kind !== Kind.STUDENT) return -1;
            else if (a.kind !== Kind.STUDENT && b.kind === Kind.STUDENT)
                return 1;
            return 0;
        });

export const getMembershipIndex = (
    memberships: UserMembership[],
    courseId: number
) => memberships.findIndex((membership) => membership.course.id === courseId);

// Note backend expects Monday=0.
export const daysToParams = (days: number[], offset: number) =>
    days.length > 0
        ? days
              .sort()
              .map((day) => (day + 6 + offset) % 7)
              .reduce((acc, cur) => `${acc}${cur},`, "byweekday:")
              .slice(0, -1)
        : "";

export const paramsToDays = (params: string, offset: number) =>
    params
        .substring(params.indexOf(":") + 1)
        .split(",")
        .map((s) => parseInt(s, 10))
        .map((day) => (day + 1 - offset) % 7);
