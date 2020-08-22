import React from "react";
import { withAuth } from "../context/auth";
import Home from "../components/Home/Home";
import AccountSettings from "../components/Home/AccountSettings/AccountSettings";

const LandingPage = () => {
    return (
        <Home>
            <AccountSettings />
        </Home>
    );
};

export default withAuth(LandingPage);
