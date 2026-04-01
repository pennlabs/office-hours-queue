import Head from "next/head";
import Home from "../components/Home/Home";
import Guide from "../components/Guide";
import { SITE_NAME } from "../utils/branding";

const GuidePage = () => {
    return (
        <>
            <Head>
                <title>{`${SITE_NAME} | FAQ`}</title>
            </Head>
            <Home>
                <Guide />
            </Home>
        </>
    );
};

export default GuidePage;
