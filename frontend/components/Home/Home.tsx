import React from "react";
import { Grid } from "semantic-ui-react";
import HomeSidebar from "./HomeSidebar";

const Home = ({ children, ...props }) => {
    return (
        <Grid columns={2} divided style={{ width: "100%" }} stackable>
            <HomeSidebar />
            {children}
        </Grid>
    );
};

export default Home;
