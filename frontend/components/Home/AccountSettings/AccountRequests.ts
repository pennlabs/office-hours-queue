import useSWR from "swr";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import getCsrf from "../../../csrf";

export interface User {
    firstName: string;
    lastName: string;
    email: string;
    smsNotificationsEnabled: boolean;
    smsVerified: boolean;
    phoneNumber?: string;
}

export function useAccountInfo(initialUser) {
    const { data, error, isValidating, mutate } = useSWR("/api/accounts/me/", {
        initialData: initialUser,
    });

    const profile: User = data
        ? {
              firstName: data.first_name,
              lastName: data.last_name,
              email: data.email,
              smsNotificationsEnabled: data.profile?.sms_notifications_enabled,
              smsVerified: data.profile?.sms_verified,
              phoneNumber: data.profile?.phone_number,
          }
        : null;

    return [profile, error, isValidating, mutate];
}

export async function updateUser(user) {
    const payload: any = {};
    if (user.firstName) {
        payload.first_name = user.firstName;
    }
    if (user.lastName) {
        payload.last_name = user.lastName;
    }

    payload.profile = {};
    payload.profile.sms_notifications_enabled = user.smsNotificationsEnabled;

    if (user.phoneNumber) {
        // TODO: Better error handling
        payload.profile.phone_number = parsePhoneNumberFromString(
            String(user.phoneNumber),
            "US"
        ).number;
    }

    let res = await fetch("/api/accounts/me/", {
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
