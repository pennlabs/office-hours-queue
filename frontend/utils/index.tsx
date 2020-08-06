// import {useQuery} from "@apollo/react-hooks";
import React from "react";

export function isValidEmail(email) {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(email);
}

export function isValidURL(url) {
    const pattern = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/;
    return pattern.test(url);
}

// export function useImperativeQuery(query) {
//   const { refetch } = useQuery(query, { skip: true });
//   return (variables) => {
//     return refetch(variables);
//   };
// }
//
export function roleSortFunc(a, b) {
    const order = ["PROFESSOR", "HEAD_TA", "TA", "STUDENT"];
    return order.indexOf(a) - order.indexOf(b);
}

export function leadershipSortFunc(a, b) {
    if (a.kind !== b.kind) {
        return roleSortFunc(a.kind, b.kind);
    }
    if (a.user.fullName !== b.user.fullName) {
        return a.user.fullName < b.user.fullName ? -1 : 1;
    }
    if (a.user.email < b.user.email) {
        return a.user.email < b.user.email ? -1 : 1;
    }
    return 0;
}

export function semesterSortFunc(a, b) {
    const order = ["FALL", "SUMMER", "SPRING"];
    return order.indexOf(a) - order.indexOf(b);
}

export function courseSortFunc(a, b) {
    if (a.year !== b.year) {
        // Recent years first
        return a.year > b.year ? -1 : 1;
    }
    if (a.semester !== b.semester) {
        return semesterSortFunc(a.semester, b.semester);
    }
    if (a.department !== b.department) {
        return a.department < b.department ? -1 : 1;
    }
    if (a.courseCode !== b.courseCode) {
        const collator = new Intl.Collator(undefined, {
            numeric: true,
            sensitivity: "base",
        });
        return collator.compare(a.courseCode, b.courseCode);
    }
    if (a.courseTitle !== b.courseTitle) {
        return a.courseTitle < b.courseTitle ? -1 : 1;
    }
    if (a.id < b.id) {
        return a.id < b.id ? -1 : 1;
    }
    return 0;
}

export function queueSortFunc(a, b) {
    if (a.name !== b.name) {
        return a.name < b.name ? -1 : 1;
    }
    return 0;
}

export function linkifyComponentDecorator(href, text, key) {
    return (
        <a href={href} key={key} target="_blank" rel="noopener noreferrer">
            {text}
        </a>
    );
}

export function uidFromGlobalId(globalId) {
    return atob(globalId).split(":")[1];
}

export function globalIdEquals(string1, string2) {
    return uidFromGlobalId(string1) === uidFromGlobalId(string2);
}