import { useFilteredResource, FilteredResourceResponse } from "./resources";
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

const summaryFilterToQuery = (
    filter: Partial<QuestionSummaryFilters>
): string => {
    return (
        // eslint-disable-next-line
        "?" +
        Object.keys(filter)
            .map((key) => {
                let renamedKey: string;
                if (key === "timeAskedGt") {
                    renamedKey = "time_asked__gt";
                } else if (key === "timeAskedLt") {
                    renamedKey = "time_asked__lt";
                } else {
                    renamedKey = key;
                }
                return `${encodeURIComponent(renamedKey)}=${encodeURIComponent(
                    filter[key]
                )}`;
            })
            .join("&")
    );
};

export const useQuestions = (
    courseId: number,
    initialQuestions: QuestionListResult
): FilteredResourceResponse<QuestionListResult, QuestionSummaryFilters> => {
    const {
        data,
        error,
        isValidating,
        filters,
        updateFilter,
    } = useFilteredResource(
        `/courses/${courseId}/questions/`,
        summaryFilterToQuery,
        initialQuestions
    );

    return {
        data,
        error,
        isValidating,
        filters,
        updateFilter,
    };
};
