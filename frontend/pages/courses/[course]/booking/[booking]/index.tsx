import React from "react";
import { useRouter } from "next/router";
import Booking from "../../../../../components/Calendar/StudentCalendar/StudentBookings/Booking";
import Head from "next/head";
import { withAuth } from "../../../../../context/auth";

function BookingPage() {
    const router = useRouter();
    const { booking, course } = router.query;

    if (!booking || !course) {
        return null; // or a loading state
    }

    return (
        <>
            <Head>
                <title>Booking Details</title>
            </Head>
            <main>
                <Booking
                    booking={booking as string}
                    course={course as string}
                />
            </main>
        </>
    );
}

export default withAuth(BookingPage);
