import { useFilteredResource, FilteredResourceResponse } from "./resources";
import { QuestionStatus, Question } from "../../types";

export enum SummaryOrderBy {
    TimeAskedAsc = "time_asked",
    TimeAskedDesc = "-time_asked",
}

export interface QuestionSummaryFilters {
    page: number;
    timeAskedGt: string;
    timeAskedLt: string;
    status: QuestionStatus;
    search: string;
    orderBy: SummaryOrderBy;
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
                } else if (key === "orderBy") {
                    renamedKey = "order_by";
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

interface QuestionsFilterResponse
    extends FilteredResourceResponse<
        QuestionListResult,
        QuestionSummaryFilters
    > {
    downloadUrl: string;
}

export const useQuestions = (
    courseId: number,
    initialQuestions: QuestionListResult
): QuestionsFilterResponse => {
    const baseUrl = `/api/courses/${courseId}/questions/`;

    const {
        data,
        error,
        isValidating,
        filters,
        updateFilter,
    } = useFilteredResource(baseUrl, summaryFilterToQuery, initialQuestions, {
        page: 1,
        orderBy: SummaryOrderBy.TimeAskedDesc,
    });

    const filterCopy = { ...filters };
    delete filterCopy.page;
    const filterString = summaryFilterToQuery(filterCopy);

    // get rid of trailing slash
    let downloadUrl = `/api${baseUrl.slice(0, -1)}`;

    // filter is empty will return "?"
    if (filterString.length === 1) {
        downloadUrl += "?format=xlsx";
    } else {
        downloadUrl += `${filterString}&format=xlsx`;
    }

    return {
        data,
        error,
        isValidating,
        filters,
        downloadUrl,
        updateFilter,
    };
};
