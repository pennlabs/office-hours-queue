import { NextPageContext } from "next";
import { User, Kind } from "../types";

export default function staffCheck(user: User, ctx: NextPageContext) {
    const {
        query: { course },
    } = ctx;
    let parsedCourse: number;
    if (typeof course == "string") {
        parsedCourse = parseInt(course, 10);
    } else {
        parsedCourse = parseInt(course[0], 10);
    }

    const foundCourse = user.membershipSet.find(
        (membership) => membership.course.id === parsedCourse
    );
    return foundCourse.kind !== Kind.STUDENT;
}
