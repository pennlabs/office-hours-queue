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
): [boolean, Dispatch<SetStateAction<Boolean>>, MutableRefObject<() => void>] {
    const player = useRef<UIfx>();
    useEffect(() => {
        player.current = new UIfx(audio, { throttleMs: 100 });
    }, []);

    const [notifs, setNotifs] = useState(true);

    const playFunc = () => {
        if (notifs) {
            player.current?.play();
        }
    };

    const play = useRef<() => void>(playFunc);
    play.current = playFunc;

    return [notifs, setNotifs, play];
}
