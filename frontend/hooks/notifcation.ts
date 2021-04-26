export function askNotificationPermissions() {
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
    } else {
        try {
            Notification.requestPermission();
        } catch {
            console.log("Notifications API not supported on this device");
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
            console.log("Notifications API not supported on this device");
        }
    }
}

export function checkPermissions() {
    return localStorage && localStorage.getItem("notifs") === "false";
}

export function getPermissions() {
    return typeof Notification !== "undefined" && Notification.permission;
}
