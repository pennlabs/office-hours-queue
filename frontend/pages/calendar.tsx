import Head from "next/head";
import Home from "../components/Home/Home";
import Calendar from "../components/Calendar/StudentCalendar/StudentCalendar";
import { withAuth } from "../context/auth";
import { SITE_NAME } from "../utils/branding";

const CalendarPage = () => {
    return (
        <>
            <Head>
                <title>{`${SITE_NAME} | Calendar`}</title>
            </Head>
            <Home>
                <Calendar />
            </Home>
        </>
    );
};

export default withAuth(CalendarPage);
