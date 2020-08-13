import useSWR from "swr";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import getCsrf from "../../../csrf";
import { User } from "../../../types";

export function useAccountInfo(initialUser) {
    const { data, error, isValidating, mutate } = useSWR("/api/accounts/me/", {
        initialData: initialUser,
    });

    const profile: User = data
        ? {
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              smsNotificationsEnabled: data.profile?.smsNotificationsEnabled,
              smsVerified: data.profile?.smsVerified,
              phoneNumber: data.profile?.phoneNumber,
          }
        : null;

    return [profile, error, isValidating, mutate];
}

export async function validateSMS(code) {
    const payload = {
        profile: {
            smsVerificationCode: code,
        },
    };
    const res = await fetch("/api/accounts/me/", {
        method: "PATCH",
        credentials: "include",
        mode: "same-origin",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrf(),
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        // TODO: figure out how to pass through django error to this error
        throw new Error("validate phone failed");
    }
}

export async function updateUser(user) {
    const payload: any = {};
    if (user.firstName) {
        payload.firstName = user.firstName;
    }
    if (user.lastName) {
        payload.lastName = user.lastName;
    }

    payload.profile = {};
    payload.profile.smsNotificationsEnabled = user.smsNotificationsEnabled;

    if (user.phoneNumber) {
        // TODO: Better error handling
        payload.profile.phoneNumber = parsePhoneNumberFromString(
            String(user.phoneNumber),
            "US"
        ).number;
    }

    const res = await fetch("/api/accounts/me/", {
        method: "PATCH",
        credentials: "include",
        mode: "same-origin",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrf(),
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error("update user failed");
    }
}
