import React, { useState } from "react";
import {
    Accordion,
    Dropdown,
    Form,
    Modal,
    Message,
    Icon,
    Button,
} from "semantic-ui-react";
import { Announcement } from "../../types";
import { useAnnouncements } from "../../hooks/data-fetching/course";

interface AnnouncementsProps {
    courseId: number;
    initialAnnouncements: Announcement[];
    staff: boolean;
}

const DeleteAnnouncementModal = () => {
    return (
        <Modal size="tiny" open={false}>
            <Modal.Header>Delete Announcement</Modal.Header>
            <Modal.Content>
                Are you sure you want to delete this announcement?
            </Modal.Content>
            <Modal.Actions>
                <Button>Cancel</Button>
                <Button negative>Delete</Button>
            </Modal.Actions>
        </Modal>
    );
};

const EditAnnouncementModal = () => {
    return (
        <Modal size="small" open={false}>
            <Modal.Header>Edit Announcement</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <Form.TextArea
                            placeholder="Experiencing technical difficulties, will be back in 10 minutes"
                            style={{ height: "8rem" }}
                        />
                    </Form.Field>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button>Cancel</Button>
                <Button positive>Save</Button>
            </Modal.Actions>
        </Modal>
    );
};

const AnnouncementMessage = ({
    announcement,
    staff,
}: {
    announcement: Announcement;
    staff: boolean;
}) => {
    return (
        <>
            <Message icon>
                {staff && (
                    <Dropdown
                        icon={
                            <Icon
                                name="ellipsis vertical"
                                style={{
                                    width: "auto",
                                    margin: "0",
                                    paddingLeft: "4px",
                                }}
                            />
                        }
                        direction="left"
                        style={{
                            position: "absolute",
                            right: "1rem",
                            top: "1rem",
                        }}
                    >
                        <Dropdown.Menu>
                            <Dropdown.Item>Edit</Dropdown.Item>
                            <Dropdown.Item>Delete</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                )}
                <Icon name="comment alternate outline" />
                <Message.Content>
                    <Message.Header>{`From ${announcement.author}`}</Message.Header>
                    {announcement.content}
                </Message.Content>
            </Message>
        </>
    );
};

export default function Announcements(props: AnnouncementsProps) {
    const { courseId, initialAnnouncements, staff } = props;

    const { data: announcements } = useAnnouncements(
        courseId,
        initialAnnouncements
    );
    const [open, setOpen] = useState(false);

    return (
        <>
            <DeleteAnnouncementModal />
            <EditAnnouncementModal />
            <Accordion fluid styled>
                <Accordion.Title
                    style={{
                        display: "flex",
                        height: "4rem",
                        alignItems: "center",
                    }}
                    active={open}
                    onClick={() => setOpen(!open)}
                >
                    <Icon name="dropdown" />
                    Active Announcements
                </Accordion.Title>
                <Accordion.Content active={open}>
                    {announcements!.map((a) => (
                        <AnnouncementMessage
                            announcement={a}
                            key={a.id}
                            staff={staff}
                        />
                    ))}
                </Accordion.Content>
            </Accordion>
        </>
    );
}
