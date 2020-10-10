import UIfx from "uifx";
import {
    useState,
    useRef,
    useEffect,
    Dispatch,
    SetStateAction,
    MutableRefObject,
} from "react";

export function usePlayer(
    audio: string
): [
    boolean,
    Dispatch<SetStateAction<Boolean>>,
    MutableRefObject<(() => void) | undefined>
] {
    const player = useRef<UIfx>();
    useEffect(() => {
        player.current = new UIfx(audio, { throttleMs: 100 });
    });

    const [notifs, setNotifs] = useState(true);

    const play = useRef<() => void>();
    play.current = () => {
        if (notifs) {
            player.current?.play();
        }
    };

    return [notifs, setNotifs, play];
}
