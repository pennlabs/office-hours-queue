import { SemanticCOLORS } from "semantic-ui-react";
import { UserMembership } from "../../types";

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

export const filterSortMemberships = (memberships: UserMembership[]) =>
    memberships
        .filter((m) => !m.course.archived)
        .sort((a, b) => a.course.id - b.course.id);

export const getMembershipIndex = (memberships, courseId) =>
    memberships.findIndex((membership) => membership.course.id === courseId);
