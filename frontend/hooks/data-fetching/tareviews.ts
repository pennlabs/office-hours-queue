import { Review } from "../../types";
import { useFilteredResource, FilteredResourceResponse } from "./resources";
import { doApiRequest } from "../../utils/fetch";
import { logException } from "../../utils/sentry";

export enum ReviewsOrderBy {
    TimeAskedAsc = "time_asked",
    TimeAskedDesc = "-time_asked",
}

export interface ReviewsFilters {
    page: number;
    ta: string; // perhaps TA name?
    rating: number;
    search: string;
    // more parameters to sort reviews
    orderBy: ReviewsOrderBy;
}

export interface ReviewListResult {
    count: number;
    next: string;
    previous: string;
    results: Review[]; // define Review type
}

const summaryFilterToQuery = (filter: Partial<ReviewsFilters>): string => {
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

interface ReviewsFilterResponse
    extends FilteredResourceResponse<ReviewListResult, ReviewsFilters> {
    downloadUrl: string;
}

export const useReviews = (
    courseId: number,
    initialReviews?: ReviewListResult
): ReviewsFilterResponse => {
    const baseUrl = `/api/courses/${courseId}/reviews`; // not implemented yet

    const { data, error, isValidating, filters, updateFilter } =
        useFilteredResource(baseUrl, summaryFilterToQuery, initialReviews, {
            page: 1,
            orderBy: ReviewsOrderBy.TimeAskedDesc,
        });

    const filterCopy = { ...filters };
    delete filterCopy.page;
    const filterString = summaryFilterToQuery(filterCopy);

    // get rid of trailing slash
    let downloadUrl = baseUrl.slice(0, -1);

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

export async function createReview(
    courseId: number,
    queueId: number,
    questionId: number,
    payload: { rating: number; content: string }
) {
    const res = await doApiRequest(
        `/api/courses/${courseId}/queues/${queueId}/questions/${questionId}/review/`,
        {
            method: "POST",
            body: payload,
        }
    );
    if (!res.ok) {
        const error = await res.json();
        const errorObj = Error(JSON.stringify(error));
        logException(errorObj, JSON.stringify(payload));
        throw errorObj;
    }
}
