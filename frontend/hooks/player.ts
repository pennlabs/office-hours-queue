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
    MutableRefObject<(string) => void>
] {
    const player = useRef<UIfx>();
    useEffect(() => {
        player.current = new UIfx(audio, { throttleMs: 100 });
    }, [audio]);

    const [notifs, setNotifs] = useState(false);

    useEffect(() => {
        if (localStorage != null) {
            setNotifs(localStorage.getItem("notifs") === "true" ? true : false);
        }
    }, []);

    const playFunc = (message: string) => {
        if (notifs) {
            player.current?.play();
            new Notification("Alert", {
                body: message,
                icon: "../favicon.ico",
            });
        }
    };

    const play = useRef<(string) => void>(playFunc);
    play.current = playFunc;

    return [notifs, setNotifs, play];
}
