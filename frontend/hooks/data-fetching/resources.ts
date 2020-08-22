import useSWR, { ConfigInterface } from "swr";
import {
    Identifiable,
    mutateResourceFunction,
    mutateResourceListFunction,
} from "../../types";
import { doApiRequest } from "../../utils/fetch";

export function useResource<R>(
    url: string,
    initialData?: R
): [R, any, boolean, mutateResourceFunction<R>] {
    const { data, error, isValidating, mutate } = useSWR(url, {
        initialData,
    });
    const mutateWithAPI = async (
        newResource: Partial<R>,
        method: string = "PATCH"
    ) => {
        mutate({ ...data, ...newResource }, false);
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
): [R[], any, boolean, mutateResourceListFunction<R>] {
    const { data, error, isValidating, mutate } = useSWR(listUrl, {
        initialData,
        ...config,
    });
    const mutateWithAPI = async (
        id: number,
        patchedResource: Partial<R> | null,
        method: string = "PATCH"
    ) => {
        const [patchedList, didPatch] = patchInList(data, id, patchedResource);
        if (didPatch) {
            // Only perform an API request when the patch finds a matching entry.
            mutate(patchedList, false);
            await doApiRequest(getResourceUrl(id), {
                method,
                body: patchedResource,
            });
        }
        // Always revalidate, even if mutate was a no-op.
        return mutate();
    };
    return [data, error, isValidating, mutateWithAPI];
}
