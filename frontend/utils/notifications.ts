import { logException } from "./sentry";

export function browserSupportsNotifications() {
    return typeof window !== "undefined" && "Notification" in window;
}

export function askNotificationPermissions() {
    if (browserSupportsNotifications()) {
        try {
            Notification.requestPermission();
        } catch (e) {
            logException(e);
        }
    }
}

export function playNotification(message: string) {
    if (browserSupportsNotifications()) {
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
