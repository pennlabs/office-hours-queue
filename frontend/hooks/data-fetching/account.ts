import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import _ from "lodash";
import { useResource } from "@pennlabs/rest-hooks";
import { User } from "../../types";
import { doApiRequest } from "../../utils/fetch";

export function useAccountInfo(initialUser?: User) {
    const { data, error, isValidating, mutate } = useResource(
        "/api/accounts/me/",
        {
            initialData: initialUser,
        }
    );
    if (data) {
        return { data, error, isValidating, mutate: () => mutate() };
    }
    throw new Error("Could not get user account info");
}

export async function validateSMS(code) {
    const payload = {
        profile: {
            smsVerificationCode: code,
        },
    };
    const res = await doApiRequest("/api/accounts/me/", {
        method: "PATCH",
        body: payload,
    });

    if (!res.ok) {
        const body = await res.json();
        throw new Error(body.detail);
    }
}

export async function resendSMSVerification() {
    const res = await doApiRequest("/api/accounts/me/resend/", {
        method: "POST",
    });

    if (!res.ok) {
        throw new Error("could not resend verification code");
    }
}

export async function updateUser(payload: Partial<User>) {
    const processedPayload: Partial<User> = _.cloneDeep(payload);
    if (processedPayload.profile) {
        if (!processedPayload.profile.smsNotificationsEnabled) {
            delete processedPayload.profile.phoneNumber;
        } else if (processedPayload.profile.phoneNumber) {
            // TODO: Better error handling
            const parsedNumber = parsePhoneNumberFromString(
                String(processedPayload.profile.phoneNumber),
                "US"
            )?.number;

            if (!parsedNumber) {
                throw new Error("phone parsing failed");
            }

            processedPayload.profile.phoneNumber = parsedNumber as string;
        }
    }

    const res = await doApiRequest("/api/accounts/me/", {
        method: "PATCH",
        body: processedPayload,
    });

    if (!res.ok) {
        throw new Error("update user failed");
    }
}
