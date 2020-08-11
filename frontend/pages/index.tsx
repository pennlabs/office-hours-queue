import React, { useContext, useState } from "react";
import { AuthUserContext } from "../context/auth";
import Home from "../components/Home/Home";
import AuthPrompt from "../components/Auth/AuthPrompt";

const LandingPage = () => {
    const { user } = useContext(AuthUserContext);

    return user ? (
        <Home />
    ) : (
            <AuthPrompt />
        );
};

export default LandingPage;
