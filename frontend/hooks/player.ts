import UIfx from "uifx";
import {
    useState,
    useRef,
    useEffect,
    Dispatch,
    SetStateAction,
    MutableRefObject,
} from "react";
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
        if (localStorage != null) {
            setNotifs(localStorage.getItem("notifs") === "true");
        }
    }, []);

    const pushNotifcation = (message) =>
        new Notification("Alert", {
            body: message,
            icon: "../favicon.ico",
        });

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
