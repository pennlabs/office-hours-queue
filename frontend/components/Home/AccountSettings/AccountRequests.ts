import useSWR from "swr";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { User } from "../../../types";
import { doApiRequest } from "../../../utils/fetch";

export function useAccountInfo(initialUser): [
    User,
    any,
    boolean,
    (data?: any, shouldRevalidate?: boolean) => Promise<any>
] {
    const { data, error, isValidating, mutate } = useSWR("/accounts/me/", {
        initialData: initialUser,
    });
    return [data, error, isValidating, mutate];
}

export async function validateSMS(code) {
    const payload = {
        profile: {
            smsVerificationCode: code,
        },
    };
    const res = await doApiRequest("/accounts/me/", {
        method: "PATCH",
        body: payload,
    });

    if (!res.ok) {
        // TODO: figure out how to pass through django error to this error
        throw new Error("validate phone failed");
    }
}

export async function updateUser(payload) {
    if (payload.profile.phoneNumber) {
        // TODO: Better error handling
        payload.profile.phoneNumber = parsePhoneNumberFromString(
            String(payload.profile.phoneNumber),
            "US"
        ).number;
    }
    const res = await doApiRequest("/accounts/me/", {
        method: "PATCH",
        body: payload,
    });

    if (!res.ok) {
        throw new Error("update user failed");
    }
}
