import React from "react";
import { Form, Button, Header, Icon, Segment, Label } from "semantic-ui-react";
import moment from "moment";

interface SlidingBookingFormProps {
    slot: {
        start: Date;
        end: Date;
    };
    occurrence: {
        title: string;
        description: string;
        location: string;
        course_id: number;
    };
    onBack: () => void;
    onConfirm: () => void;
}

export const SlidingBookingForm: React.FC<SlidingBookingFormProps> = ({
    slot,
    occurrence,
    onBack,
    onConfirm,
}) => {
    return (
        <div
            style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "16px",
                    gap: "16px",
                }}
            >
                <Button
                    icon
                    onClick={onBack}
                    style={{
                        backgroundColor: "transparent",
                        padding: "8px",
                        borderRadius: "50%",
                        transition: "background-color 0.2s ease",
                        flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f5f5f5";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                    }}
                >
                    <Icon name="arrow left" />
                </Button>
                <div style={{ flex: 1 }}>
                    <Header as="h3" style={{ margin: 0 }}>
                        Confirm Booking
                    </Header>
                </div>
            </div>

            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    paddingRight: "8px",
                    marginBottom: "16px",
                }}
            >
                <Segment style={{ padding: "16px" }}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "16px",
                            marginBottom: "16px",
                        }}
                    >
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    color: "#666",
                                    marginBottom: "4px",
                                    fontWeight: "500",
                                }}
                            >
                                Title
                            </label>
                            <p style={{ margin: 0, fontSize: "1em" }}>
                                {occurrence.title}
                            </p>
                        </div>
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    color: "#666",
                                    marginBottom: "4px",
                                    fontWeight: "500",
                                }}
                            >
                                Location
                            </label>
                            <p style={{ margin: 0, fontSize: "1em" }}>
                                {occurrence.location || "No location provided"}
                            </p>
                        </div>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                display: "block",
                                color: "#666",
                                marginBottom: "4px",
                                fontWeight: "500",
                            }}
                        >
                            Description
                        </label>
                        <p style={{ margin: 0, fontSize: "1em" }}>
                            {occurrence.description ||
                                "No description provided"}
                        </p>
                    </div>

                    <Form>
                        <Form.Field>
                            <label
                                style={{
                                    display: "block",
                                    color: "#666",
                                    marginBottom: "4px",
                                    fontWeight: "500",
                                }}
                            >
                                Additional Notes (Optional)
                            </label>
                            <Form.TextArea
                                placeholder="Add any additional information for your instructor..."
                                style={{
                                    minHeight: "80px",
                                    borderRadius: "8px",
                                    border: "1px solid #ddd",
                                    padding: "12px",
                                    fontSize: "1em",
                                    resize: "vertical",
                                }}
                            />
                        </Form.Field>
                    </Form>
                </Segment>
            </div>

            <div
                style={{
                    padding: "12px 0",
                    borderTop: "1px solid #eee",
                    backgroundColor: "white",
                    position: "sticky",
                    bottom: 0,
                    left: 0,
                    right: 0,
                }}
            >
                <Button
                    color="green"
                    fluid
                    size="large"
                    onClick={onConfirm}
                    style={{
                        marginBottom: "8px",
                        borderRadius: "8px",
                        padding: "12px",
                        fontSize: "1.1em",
                    }}
                >
                    <Icon name="check" />
                    Confirm Booking
                </Button>
                <Button
                    color="grey"
                    fluid
                    onClick={onBack}
                    style={{
                        borderRadius: "8px",
                        padding: "12px",
                        fontSize: "1.1em",
                    }}
                >
                    <Icon name="arrow left" />
                    Back
                </Button>
            </div>
        </div>
    );
};
