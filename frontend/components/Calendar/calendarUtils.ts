import { UserMembership } from "../../types";
import { SemanticCOLORS } from "semantic-ui-react";

export const eventColors: SemanticCOLORS[] = [
    "red",
    "olive",
    "teal",
    "pink",
    "orange",
    "yellow",
    "violet",
    "brown",
    "yellow",
    "purple",
    "grey",
];

export const filterSortMemberships = (memberships: UserMembership[]) =>
    memberships
        .filter((m) => !m.course.archived)
        .sort((a, b) => a.course.id - b.course.id);