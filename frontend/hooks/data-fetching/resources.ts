import { useState, useRef, useEffect } from "react";
import useSWR, { ConfigInterface } from "swr";
import {
    Identifiable,
    mutateResourceFunction,
    mutateResourceListFunction,
} from "../../types";
import { doApiRequest } from "../../utils/fetch";

export function useResource<R>(
    url: string,
    initialData?: R,
    config?: ConfigInterface<R>
): [R | undefined, any, boolean, mutateResourceFunction<R>] {
    const { data, error, isValidating, mutate } = useSWR(url, {
        initialData,
        ...config,
    });
    const mutateWithAPI = async (
        newResource: Partial<R>,
        method: string = "PATCH"
    ) => {
        if (data) {
            mutate({ ...data, ...newResource }, false);
        }
        await doApiRequest(url, {
            method,
            body: newResource,
        });

        return mutate();
    };
    return [data, error, isValidating, mutateWithAPI];
}

/**
 * Patch in an updated element in a list.
 * @param list list of elements, where elements have an `id` property.
 * @param id identifier to update
 * @param patch updated properties. If null, delete from list.
 */
function patchInList<T extends Identifiable>(
    list: T[],
    id: number,
    patch: Partial<T> | null
): [T[], boolean] {
    for (let i = 0; i < list.length; i += 1) {
        const obj = list[i];
        // If the ID of this element matches the desired ID
        if (obj.id === id) {
            if (patch === null) {
                return [[...list.slice(0, i), ...list.slice(i + 1)], true];
            }
            const newObj = { ...obj, ...patch };
            return [[...list.slice(0, i), newObj, ...list.slice(i + 1)], true];
        }
    }
    // if no match exists, return the original list.
    return [list, false];
}

export function useResourceList<R extends Identifiable>(
    listUrl: string | (() => string),
    getResourceUrl: (id: number) => string,
    initialData?: R[],
    config?: ConfigInterface<R[]>
): [R[] | undefined, any, boolean, mutateResourceListFunction<R>] {
    const { data, error, isValidating, mutate } = useSWR(listUrl, {
        initialData,
        ...config,
    });
    const mutateWithAPI = async (
        id: number,
        patchedResource: Partial<R> | null,
        method: string = "PATCH"
    ) => {
        if (data) {
            const [patchedList, didPatch] = patchInList(
                data,
                id,
                patchedResource
            );
            if (didPatch) {
                mutate(patchedList, false);
            }
        }
        // Only perform an API request when the patch finds a matching entry.
        await doApiRequest(getResourceUrl(id), {
            method,
            body: patchedResource,
        });
        // Always revalidate, even if mutate was a no-op.
        return mutate();
    };
    return [data, error, isValidating, mutateWithAPI];
}

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
