import UIfx from "uifx";
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";

export function usePlayer(
    audio: string
): [boolean, Dispatch<SetStateAction<Boolean>>, () => void] {
    const player = useRef<UIfx | undefined>();
    useEffect(() => {
        player.current = new UIfx(audio, { throttleMs: 100 });
    }, []);

    const [notifs, setNotifs] = useState(true);

    const play = () => {
        if (notifs) {
            player.current?.play();
        }
    };

    return [notifs, setNotifs, play];
}
