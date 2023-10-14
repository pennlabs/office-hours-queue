import "semantic-ui-css/semantic.min.css";
import "../styles/index.css";

import { useEffect } from "react";
import { Announcement } from "@esinx/pennlabs-ui";
import { SWRConfig } from "swr";

import { doApiRequest } from "../utils/fetch";
import withGA from "../utils/ga/withGA";
import { askNotificationPermissions } from "../utils/notifications";

const MyApp = ({ Component, pageProps }) => {
    useEffect(() => {
        askNotificationPermissions();
    }, []);
    return (
        <>
            <SWRConfig
                value={{
                    fetcher: (path, ...args) =>
                        doApiRequest(path, ...args).then((res) => res.json()),
                    refreshWhenHidden: true,
                }}
            >
                {/* This is necessary for generic HOC */}
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <Component {...pageProps} />
            </SWRConfig>
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    padding: 20,
                }}
            >
                <Announcement title="Weekend Maintenance Alert" type="issue" />
            </div>
        </>
    );
};

export default withGA(MyApp);
