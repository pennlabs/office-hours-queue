import React from "react";
import { Grid } from "semantic-ui-react";
import { NextPageContext } from "next";
import CourseWrapper from "../../../components/Course/CourseWrapper";
import { withAuth } from "../../../context/auth";
import staffCheck from "../../../utils/staffcheck";
import { withProtectPage } from "../../../utils/protectpage";
import { doApiRequest } from "../../../utils/fetch";
import { isLeadershipRole } from "../../../utils/enums";
import { CoursePageProps, Course, Membership } from "../../../types";
import Summary from "../../../components/Course/Summary/Summary";
import { QuestionListResult } from "../../../hooks/data-fetching/questionsummary";
import nextRedirect from "../../../utils/redirect";

interface SummaryPageProps extends CoursePageProps {
    questionListResult: QuestionListResult;
}
const SummaryPage = (props: SummaryPageProps) => {
    const { course, leadership, questionListResult } = props;
    return (
        <Grid columns="equal" divided style={{ width: "100%" }} stackable>
            <CourseWrapper
                course={course}
                leadership={leadership}
                render={() => {
                    return (
                        <Summary
                            course={course}
                            questionListResult={questionListResult}
                        />
                    );
                }}
            />
        </Grid>
    );
};

SummaryPage.getInitialProps = async (
    context: NextPageContext
): Promise<SummaryPageProps> => {
    const { query, req } = context;
    const data = {
        headers: req ? { cookie: req.headers.cookie } : undefined,
    };

    let course: Course;
    let leadership: Membership[];
    let questionListResult: QuestionListResult;

    try {
        [course, leadership, questionListResult] = await Promise.all([
            doApiRequest(`/courses/${query.course}/`, data).then((res) =>
                res.json()
            ),
            doApiRequest(
                `/courses/${query.course}/members/`,
                data
            ).then((res) => res.json()),
            doApiRequest(
                `/courses/${query.course}/questions/`,
                data
            ).then((res) => res.json()),
        ]);
    } catch (err) {
        nextRedirect(context, () => true, "/404");
        throw new Error("Next should redirect: unreachable");
    }

    return {
        course,
        leadership: leadership.filter((m) => isLeadershipRole(m.kind)),
        questionListResult,
    };
};

export default withProtectPage(withAuth(SummaryPage), (user, ctx) => {
    return staffCheck(user, ctx);
});
