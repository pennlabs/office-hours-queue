import React, { useState, useEffect } from "react";
import { Grid } from "semantic-ui-react";
import Dashboard from "./Dashboard/Dashboard";
import AccountSettings from "./AccountSettings/AccountSettings";
import HomeSidebar from "./HomeSidebar";

const Home = ({}) => {
    const [active, setActive] = useState("dashboard");

    return (
        <Grid
            columns={2}
            divided="horizontally"
            style={{ width: "100%" }}
            stackable
        >
            <HomeSidebar active={active} clickFunc={setActive} />
            {active === "dashboard" ? (
                <Dashboard />
            ) : active === "account_settings" ? (
                <AccountSettings />
            ) : (
                <Dashboard loading={true} />
            )}
        </Grid>
    );
};

export default Home;
