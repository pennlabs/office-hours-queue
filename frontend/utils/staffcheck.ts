import { NextPageContext } from "next";
import { User, Kind } from "../types";

export default function staffCheck(user: User, ctx: NextPageContext) {
    const {
        query: { queryCourse },
    } = ctx;
    let parsedCourse: number;
    if (typeof queryCourse == "string") {
        parsedCourse = parseInt(queryCourse, 10);
    } else {
        parsedCourse = parseInt(queryCourse[0], 10);
    }

    const course = user.membershipSet.find(
        (membership) => membership.course.id === parsedCourse
    );
    return course.kind !== Kind.STUDENT;
}
