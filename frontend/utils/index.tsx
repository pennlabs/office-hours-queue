import { ALLOWED_LINKS } from "../constants";
import { Membership, Kind, User } from "../types";

export function isValidEmail(email: string) {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(email);
}

export function isValidVideoChatURL(url: string) {
    try {
        const urlObject = new URL(url);
        return ALLOWED_LINKS.reduce(
            (acc: boolean, link: string) =>
                acc ||
                urlObject.hostname === link ||
                urlObject.hostname.endsWith(`.${link}`),
            false
        );
    } catch (e) {
        return false;
    }
}

export function roleSortFunc(a: Kind, b: Kind) {
    const order = ["PROFESSOR", "HEAD_TA", "TA", "STUDENT"];
    return order.indexOf(a) - order.indexOf(b);
}

export function leadershipSortFunc(a: Membership, b: Membership) {
    if (a.kind !== b.kind) {
        return roleSortFunc(a.kind, b.kind);
    }
    if (a.user.firstName !== b.user.firstName) {
        return a.user.firstName < b.user.firstName ? -1 : 1;
    }
    if (a.user.lastName !== b.user.lastName) {
        return a.user.lastName < b.user.lastName ? -1 : 1;
    }
    if (a.user.email < b.user.email) {
        return a.user.email < b.user.email ? -1 : 1;
    }
    return 0;
}

export function getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
}
