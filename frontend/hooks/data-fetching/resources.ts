import { useState, useRef, useEffect } from "react";
import useSWR, { ConfigInterface } from "swr";

export interface FilteredResourceResponse<R, F> {
    data?: R;
    error: any;
    isValidating: boolean;
    filters: Partial<F>;
    updateFilter: (filter: Partial<F>) => void;
}

export function useFilteredResource<R, F>(
    listUrl: string | (() => string),
    filterToQuery: (filter: Partial<F>) => string,
    initialData?: R,
    initialFilter?: Partial<F>,
    config?: ConfigInterface<R>
): FilteredResourceResponse<R, F> {
    const hasMounted = useRef(false);
    useEffect(() => {
        hasMounted.current = true;
    }, []);

    const [filters, setFilters] = useState<Partial<F>>(
        // eslint-disable-next-line
        initialFilter ? initialFilter : {}
    );

    const query = listUrl + filterToQuery(filters);

    const { data, error, isValidating } = useSWR(query, {
        initialData: hasMounted.current ? undefined : initialData,
        ...config,
    });

    const updateFilter = (f: Partial<F>) => {
        setFilters({
            ...filters,
            ...f,
        });
    };

    return {
        data,
        error,
        isValidating,
        filters,
        updateFilter,
    };
}
