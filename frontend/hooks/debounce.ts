import { useRef } from "react";

function useDebounce<Args>(
    f: (...args: Args[]) => void,
    interval: number
): (...args: Args[]) => void {
    const ref = useRef<NodeJS.Timeout | null>(null);

    const debouncedF = (...args: any[]): void => {
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
