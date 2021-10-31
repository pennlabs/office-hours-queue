import { logException } from "./sentry";

export function askNotificationPermissions() {
    if ("Notification" in window) {
        try {
            Notification.requestPermission();
        } catch (e) {
            logException(e);
        }
    }
}

export function playNotification(message: string) {
    if ("Notification" in window) {
        try {
            /* eslint-disable-next-line */
            new Notification("Alert", {
                body: message,
                icon: "../favicon.ico",
            });
        } catch (e) {
            logException(e);
        }
    }
}

export function checkPermissions() {
    return localStorage && localStorage.getItem("notifs") === "false";
}
