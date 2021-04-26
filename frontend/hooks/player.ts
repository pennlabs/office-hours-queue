import UIfx from "uifx";
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { NotificationProps } from "../types";
import { playNotification, checkPermissions } from "./notifcation";

export function usePlayer(
    audio: string
): [boolean, Dispatch<SetStateAction<Boolean>>, NotificationProps] {
    const player = useRef<UIfx>();
    useEffect(() => {
        player.current = new UIfx(audio, { throttleMs: 100 });
    }, [audio]);

    const [notifs, setNotifs] = useState(true);

    useEffect(() => {
        if (checkPermissions()) {
            setNotifs(false);
        }
    }, []);

    const playFunc = (message: string) => {
        if (notifs) {
            player.current?.play();
            playNotification(message);
        }
    };

    const play = useRef<(string) => void>(playFunc);
    play.current = playFunc;

    return [notifs, setNotifs, play];
}
