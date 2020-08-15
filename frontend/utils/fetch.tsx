import getCsrf from "../csrf";

export const SITE_ORIGIN =
    process.env.NODE_ENV === "production"
        ? `https://${process.env.DOMAIN || "ohq.io"}`
        : `http://localhost:${process.env.PORT || 3000}`;

export const API_BASE_URL = `${SITE_ORIGIN}/api`;

export function getApiUrl(path: string): string {
    if (/^https?:\/\//.test(path)) {
        const url = new URL(path);
        return url.pathname + url.search;
    }
    return API_BASE_URL + path;
}

export function doApiRequest(path: string, data?: any): Promise<Response> {
    console.log(getApiUrl(path));
    if (!data) {
        data = {};
    }
    data.credentials = "include";
    data.mode = "same-origin";
    if (typeof document !== "undefined") {
        data.headers = data.headers || {};
        if (!(data.body instanceof FormData)) {
            data.headers["Accept"] = "application/json";
            data.headers["Content-Type"] = "application/json";
        }
        data.headers["X-CSRFToken"] = getCsrf();
    }
    if (data.body && !(data.body instanceof FormData)) {
        data.body = JSON.stringify(data.body);
    }
    return fetch(getApiUrl(path), data);
}
