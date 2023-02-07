import { useRef } from "react";

function useDebounce<T extends any[]>(
    f: (...args: T) => void,
    interval: number
): (...args: T) => void {
    const ref = useRef<NodeJS.Timeout | null>(null);

    const debouncedF = (...args: T): void => {
        if (ref.current) {
            clearTimeout(ref.current);
        }
        ref.current = setTimeout(() => {
            f(...args);
        }, interval);
    };

    return debouncedF;
}

export default useDebounce;
