import { Icon, Modal, SemanticICONS } from "semantic-ui-react";
import React from "react";
import Link from "next/link";
import { Occurrence, UserMembership } from "../../types";
import { dayNames, paramsToDays } from "./calendarUtils";

const IconTextBlock = (props: {
    iconName: SemanticICONS;
    children: React.JSX.Element;
}) => {
    const { iconName, children } = props;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
            }}
        >
            <Icon
                size="large"
                name={iconName}
                style={{ marginRight: "10px" }}
            />
            {children}
        </div>
    );
};

export const EventInfoModal = (props: {
    occurrence: Occurrence | null;
    membership: UserMembership | undefined;
    setOccurrence: (occurrence: Occurrence | null) => void;
}) => {
    const { occurrence, membership, setOccurrence } = props;

    return (
        <Modal
            size="tiny"
            open={occurrence !== null}
            onClose={() => setOccurrence(null)}
        >
            <Modal.Header>
                {`${membership?.course.department} ${membership?.course.courseCode} – ${occurrence?.title}`}
                <button
                    type="button"
                    style={{
                        float: "right",
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                    }}
                    onClick={() => setOccurrence(null)}
                >
                    <i className="close icon" />
                </button>
            </Modal.Header>
            <Modal.Content>
                <Modal.Description>
                    <IconTextBlock iconName="clock outline">
                        <span>
                            {occurrence?.start.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                            })}{" "}
                            -{" "}
                            {occurrence?.start.toDateString() ===
                            occurrence?.end.toDateString()
                                ? occurrence?.end.toLocaleTimeString("en-US", {
                                      hour: "numeric",
                                      minute: "numeric",
                                  })
                                : occurrence?.end.toLocaleDateString("en-US", {
                                      weekday: "long",
                                      month: "long",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "numeric",
                                  })}
                            {occurrence?.event.rule && (
                                <>
                                    <br />
                                    Weekly on{" "}
                                    {paramsToDays(
                                        occurrence.event.rule.params,
                                        0
                                    )
                                        .map((dayNum) => dayNames[dayNum])
                                        .join(", ")}
                                </>
                            )}
                        </span>
                    </IconTextBlock>
                    {occurrence?.description && (
                        <>
                            <br />
                            <IconTextBlock iconName="list">
                                <span style={{ whiteSpace: "pre-wrap" }}>
                                    {occurrence.description}
                                </span>
                            </IconTextBlock>
                        </>
                    )}
                    {occurrence?.location && (
                        <>
                            <br />
                            <IconTextBlock iconName="map marker alternate">
                                <span style={{ whiteSpace: "pre-wrap" }}>
                                    {occurrence.location}
                                </span>
                            </IconTextBlock>
                        </>
                    )}
                    <>
                        <br />
                        <IconTextBlock iconName="linkify">
                            <Link
                                href="/courses/[course]"
                                as={`/courses/${occurrence?.event.course_id}`}
                                legacyBehavior
                            >
                                Go to queue
                            </Link>
                        </IconTextBlock>
                    </>
                </Modal.Description>
            </Modal.Content>
        </Modal>
    );
};
