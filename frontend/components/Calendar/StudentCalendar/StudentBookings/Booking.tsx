import React from "react";
import { Card, Header, Icon, Button, Segment, Label } from "semantic-ui-react";
import moment from "moment";

interface BookingDetails {
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    description: string;
    courseName: string;
    isBookedBy: string;
}

function Booking({ booking, course }: { booking: string; course: string }) {
    // Example data
    const bookingDetails = {
        date: "2024-03-20",
        startTime: "4:00",
        endTime: "4:30",
        location: "Office Hours Room 101",
        description:
            "Office hours for CS 101 students. Please bring your questions about the latest assignment.",
        courseName: "CS 101",
        isBookedBy: null,
    };

    const bookedBy = "John Doe";

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                width: "100%",
                padding: "20px",
                boxSizing: "border-box",
                position: "absolute",
                top: 0,
                left: 0,
            }}
        >
            {bookingDetails.isBookedBy === null ? (
                <AvailableBookingCard bookingDetails={bookingDetails} />
            ) : bookingDetails.isBookedBy !== bookedBy ? (
                <BookedBookingCard bookingDetails={bookingDetails} />
            ) : (
                <YourBookingCard bookingDetails={bookingDetails} />
            )}
        </div>
    );
}

function AvailableBookingCard({
    bookingDetails,
}: {
    bookingDetails: BookingDetails;
}) {
    return (
        <Card style={{ width: "100%", maxWidth: "600px" }}>
            <Card.Content>
                <Card.Header>
                    <Header as="h2">
                        <Icon name="calendar check" />
                        <Header.Content>
                            Confirm Your Booking
                            <Header.Subheader>
                                Please review your booking details below
                            </Header.Subheader>
                        </Header.Content>
                    </Header>
                </Card.Header>
            </Card.Content>
            <Card.Content>
                <Segment>
                    <div
                        style={{
                            marginBottom: "20px",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                        }}
                    >
                        <Label color="blue" size="large">
                            <Icon name="calendar" />
                            {moment(bookingDetails.date).format(
                                "dddd, MMMM D, YYYY"
                            )}
                        </Label>
                        <Label color="teal" size="large">
                            <Icon name="clock" />
                            {bookingDetails.startTime} -{" "}
                            {bookingDetails.endTime}
                        </Label>
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <strong>Course:</strong> {bookingDetails.courseName}
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <strong>Location:</strong> {bookingDetails.location}
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <strong>Description:</strong>{" "}
                        {bookingDetails.description}
                    </div>
                </Segment>
            </Card.Content>
            <Card.Content extra>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "10px",
                    }}
                >
                    <Button color="grey" onClick={() => window.history.back()}>
                        <Icon name="arrow left" />
                        Back
                    </Button>
                    <Button
                        color="green"
                        onClick={() => alert("Booking confirmed!")}
                    >
                        <Icon name="check" />
                        Confirm Booking
                    </Button>
                </div>
            </Card.Content>
        </Card>
    );
}

function BookedBookingCard({
    bookingDetails,
}: {
    bookingDetails: BookingDetails;
}) {
    return (
        <Card style={{ width: "100%", maxWidth: "600px" }}>
            <Card.Content>
                <Card.Header>
                    <Header as="h2">
                        <Icon name="calendar check" />
                        <Header.Content>
                            This slot has already been booked.
                            <Header.Subheader>
                                Please select another slot if one is available.
                            </Header.Subheader>
                        </Header.Content>
                    </Header>
                </Card.Header>
            </Card.Content>
            <Card.Content>
                <Segment>
                    <div
                        style={{
                            marginBottom: "20px",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                        }}
                    >
                        <Label color="blue" size="large">
                            <Icon name="calendar" />
                            {moment(bookingDetails.date).format(
                                "dddd, MMMM D, YYYY"
                            )}
                        </Label>
                        <Label color="teal" size="large">
                            <Icon name="clock" />
                            {bookingDetails.startTime} -{" "}
                            {bookingDetails.endTime}
                        </Label>
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <strong>Course:</strong> {bookingDetails.courseName}
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <strong>Location:</strong> {bookingDetails.location}
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <strong>Description:</strong>{" "}
                        {bookingDetails.description}
                    </div>
                </Segment>
            </Card.Content>
            <Card.Content extra>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "10px",
                    }}
                >
                    <Button color="grey" onClick={() => window.history.back()}>
                        <Icon name="arrow left" />
                        Back
                    </Button>
                </div>
            </Card.Content>
        </Card>
    );
}

function YourBookingCard({
    bookingDetails,
}: {
    bookingDetails: BookingDetails;
}) {
    return (
        <Card style={{ width: "100%", maxWidth: "600px" }}>
            <Card.Content>
                <Card.Header>
                    <Header as="h2">
                        <Icon name="calendar check" />
                        <Header.Content>
                            You have a booking scheduled for this slot.
                            <Header.Subheader>
                                Please review your booking details below
                            </Header.Subheader>
                        </Header.Content>
                    </Header>
                </Card.Header>
            </Card.Content>
            <Card.Content>
                <Segment>
                    <div
                        style={{
                            marginBottom: "20px",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                        }}
                    >
                        <Label color="blue" size="large">
                            <Icon name="calendar" />
                            {moment(bookingDetails.date).format(
                                "dddd, MMMM D, YYYY"
                            )}
                        </Label>
                        <Label color="teal" size="large">
                            <Icon name="clock" />
                            {bookingDetails.startTime} -{" "}
                            {bookingDetails.endTime}
                        </Label>
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <strong>Course:</strong> {bookingDetails.courseName}
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <strong>Location:</strong> {bookingDetails.location}
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <strong>Description:</strong>{" "}
                        {bookingDetails.description}
                    </div>
                </Segment>
            </Card.Content>
            <Card.Content extra>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "10px",
                    }}
                >
                    <Button color="grey" onClick={() => window.history.back()}>
                        <Icon name="arrow left" />
                        Back
                    </Button>
                    <Button
                        color="red"
                        onClick={() => alert("Booking cancelled!")}
                    >
                        <Icon name="check" />
                        Cancel Booking
                    </Button>
                </div>
            </Card.Content>
        </Card>
    );
}

export default Booking;
