import _ from "lodash";
import { useResource } from "@pennlabs/rest-hooks";
import { User } from "../../types";
import { doApiRequest } from "../../utils/fetch";
import { logException } from "../../utils/sentry";

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
    if (
        processedPayload.profile &&
        !processedPayload.profile.smsNotificationsEnabled
    ) {
        delete processedPayload.profile.phoneNumber;
    }

    const res = await doApiRequest("/api/accounts/me/", {
        method: "PATCH",
        body: processedPayload,
    });

    if (!res.ok) {
        const error = await res.json();
        logException(error);
        throw new Error("Update user failed");
    }
}
