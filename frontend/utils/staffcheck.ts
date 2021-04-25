import { GetServerSidePropsContext } from "next";
import { User, Kind } from "../types";

/**
 * staffCheck is a helper function used to verify that the user
 * visiting a *course* page is a staff member.
 *
 * Note: this method returns false if the page is not associated with a course
 *
 */

export default function staffCheck(
    user: User,
    ctx: GetServerSidePropsContext
): boolean {
    const {
        query: { course },
    } = ctx;

    if (!course) {
        return false;
    }

    let parsedCourse: number;
    if (typeof course == "string") {
        parsedCourse = parseInt(course, 10);
    } else {
        parsedCourse = parseInt(course[0], 10);
    }

    const foundCourse = user.membershipSet.find(
        (membership) => membership.course.id === parsedCourse
    );

    if (!foundCourse) {
        return false;
    }

    return foundCourse.kind !== Kind.STUDENT;
}
