import React, { createContext, useEffect, useState } from "react";
import { Dimmer, Loader } from "semantic-ui-react";
import { useRouter } from "next/router";

export const AuthUserContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/accounts/me/").then((res) => {
            if (res.ok) {
                res.json().then((res) => {
                    setUser(res);
                    setLoading(false);
                });
            } else if (router.pathname !== "/") {
                router.push("/");
            } else {
                setLoading(false);
            }
        });
    }, [router]);

    return loading ? (
        <div
            style={{
                height: "100%",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Dimmer active inverted inline="centered">
                <Loader size="big" inverted />
            </Dimmer>
        </div>
    ) : (
        <AuthUserContext.Provider value={{ user }}>
            {children}
        </AuthUserContext.Provider>
    );
};
