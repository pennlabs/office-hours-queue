import Head from "next/head";
import Home from "../components/Home/Home";
import Calendar from "../components/Calendar/StudentCalendar";
import { withAuth } from "../context/auth";

const CalendarPage = () => {
    return (
        <>
            <Head>
                <title>OHQ | Calendar</title>
            </Head>
            <Home>
                <Calendar />
            </Home>
        </>
    );
};

export default withAuth(CalendarPage);
