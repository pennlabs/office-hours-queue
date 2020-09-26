import UIfx from "uifx";
import { useState, useEffect, Dispatch, SetStateAction } from "react";

export function usePlayer(
    audio: string
): [boolean, Dispatch<SetStateAction<Boolean>>, () => void] {
    const [player, setPlayer] = useState<UIfx | undefined>();
    useEffect(() => {
        setPlayer(
            new UIfx(audio, {
                throttleMs: 100,
            })
        );
    }, []);

    const [notifs, setNotifs] = useState(true);

    const play = () => {
        if (notifs) {
            player?.play();
        }
    };

    return [notifs, setNotifs, play];
}
