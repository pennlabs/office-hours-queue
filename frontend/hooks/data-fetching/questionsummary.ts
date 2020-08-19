import useSWR from "swr";
import { QuestionStatus, Question } from "../../types";

export interface QuestionSummaryFilters {
    page: number;
    timeAskedGt: string;
    timeAskedLt: string;
    status: QuestionStatus;
    search: string;
}

export interface QuestionListResult {
    count: number;
    next: string;
    previous: string;
    results: Question[];
}

export const useQuestions = (
    course_id: number,
    filters: Partial<QuestionSummaryFilters>,
    initialQuestions: QuestionListResult
): [QuestionListResult, any, boolean] => {
    const query = Object.keys(filters)
        .map((key) => {
            let renamedKey: string;
            if (key == "timeAskedGt") {
                renamedKey = "time_asked__gt";
            } else if (key == "timeAskedLt") {
                renamedKey = "time_asked__lt";
            } else {
                renamedKey = key;
            }
            return `${encodeURIComponent(renamedKey)}=${encodeURIComponent(
                filters[key]
            )}`;
        })
        .join("&");

    const queryUrl = `/courses/${course_id}/questions/?${query}`;
    const { data, error, isValidating } = useSWR(queryUrl, {
        initialData: initialQuestions,
    });

    return [data, error, isValidating];
};
