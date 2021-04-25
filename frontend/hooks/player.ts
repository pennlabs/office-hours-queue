import UIfx from "uifx";
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { NotificationProps } from "../types";

export function usePlayer(
    audio: string
): [boolean, Dispatch<SetStateAction<Boolean>>, NotificationProps] {
    const player = useRef<UIfx>();
    useEffect(() => {
        player.current = new UIfx(audio, { throttleMs: 100 });
    }, [audio]);

    const [notifs, setNotifs] = useState(true);

    useEffect(() => {
        if (localStorage && localStorage.getItem("notifs") === "false") {
            setNotifs(false);
        }
    }, []);

    const pushNotifcation = (message) => {
        if ("Notification" in window) {
            try {
                /* eslint-disable-next-line */
                new Notification("Alert", {
                    body: message,
                    icon: "../favicon.ico",
                });
            } catch (e) {
                console.log("Notifications API not supported on this device");
            }
        }
    };

    const playFunc = (message: string) => {
        if (notifs) {
            player.current?.play();
            pushNotifcation(message);
        }
    };

    const play = useRef<(string) => void>(playFunc);
    play.current = playFunc;

    return [notifs, setNotifs, play];
}
