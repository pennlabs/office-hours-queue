import React, { useState, useEffect, useContext } from "react";
import {
    Accordion,
    Dropdown,
    Form,
    Modal,
    Message,
    Icon,
    Button,
} from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import { Announcement, BaseUser, NotificationProps } from "../../types";
import { AuthUserContext } from "../../utils/auth";
import {
    useAnnouncements,
    createAnnouncement,
} from "../../hooks/data-fetching/course";

interface AnnouncementsProps {
    courseId: number;
    initialAnnouncements: Announcement[];
    staff: boolean;
    play: NotificationProps;
}

interface ModalProps {
    announcement: Announcement;
    setModalState: (status: ModalState) => void;
    mutate: mutateResourceListFunction<Announcement>;
}

type ModalState =
    | { isOpen: true; announcement: Announcement }
    | { isOpen: false };

const DeleteAnnouncementModal = ({
    announcement,
    setModalState,
    mutate,
}: ModalProps) => {
    return (
        <Modal size="tiny" open={true}>
            <Modal.Header>Delete Announcement</Modal.Header>
            <Modal.Content>
                Are you sure you want to delete this announcement?
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={() => setModalState({ isOpen: false })}>
                    Cancel
                </Button>
                <Button
                    negative
                    onClick={() => {
                        mutate(announcement.id, undefined, {
                            method: "DELETE",
                        });
                        setModalState({ isOpen: false });
                    }}
                >
                    Delete
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

const EditAnnouncementModal = ({
    announcement,
    setModalState,
    mutate,
}: ModalProps) => {
    const [input, setInput] = useState(announcement.content);
    return (
        <Modal size="small" open={true}>
            <Modal.Header>Edit Announcement</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <Form.TextArea
                            style={{ height: "8rem" }}
                            value={input}
                            onChange={(_, { value }) =>
                                setInput(value as string)
                            }
                        />
                    </Form.Field>
                </Form>
            </Modal.Content>
            <Modal.Actions style={{ display: "flex", alignItems: "center" }}>
                <span style={{ color: "#666666", fontSize: "0.8rem" }}>
                    <Icon name="history" />
                    Last modified{" "}
                    {new Date(announcement.timeUpdated).toLocaleString("en-us")}
                </span>
                <Button
                    style={{ marginLeft: "auto" }}
                    onClick={() => setModalState({ isOpen: false })}
                >
                    Cancel
                </Button>
                <Button
                    positive
                    onClick={() => {
                        mutate(announcement.id, { content: input });
                        setModalState({ isOpen: false });
                    }}
                >
                    Save
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

interface NewModalProps {
    setModalState: (status: boolean) => void;
    mutate: mutateResourceListFunction<Announcement>;
    courseId: number;
}

const NewAnnouncementModal = ({
    setModalState,
    mutate,
    courseId,
}: NewModalProps) => {
    const [input, setInput] = useState("");
    return (
        <Modal size="small" open={true}>
            <Modal.Header>New Announcement</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <Form.TextArea
                            style={{ height: "8rem" }}
                            value={input}
                            onChange={(_, { value }) =>
                                setInput(value as string)
                            }
                        />
                    </Form.Field>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={() => setModalState(false)}>Cancel</Button>
                <Button
                    positive
                    onClick={async () => {
                        await createAnnouncement(courseId, {
                            content: input,
                        });
                        mutate(undefined, undefined, { sendRequest: false });
                        setInput("");
                        setModalState(false);
                    }}
                >
                    Post Announcement
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

const AnnouncementMessage = ({
    announcement,
    staff,
    setDeleteState,
    setEditState,
}: {
    announcement: Announcement;
    staff: boolean;
    setDeleteState: (state: ModalState) => void;
    setEditState: (state: ModalState) => void;
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
                            <Dropdown.Item
                                onClick={() => {
                                    setEditState({
                                        isOpen: true,
                                        announcement,
                                    });
                                }}
                            >
                                <Icon name="edit outline" />
                                Edit
                            </Dropdown.Item>
                            <Dropdown.Item
                                onClick={() =>
                                    setDeleteState({
                                        isOpen: true,
                                        announcement,
                                    })
                                }
                            >
                                <Icon name="trash alternate" />
                                Delete
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                )}
                <Icon name="comment alternate outline" />
                <Message.Content style={{ paddingBottom: "1rem" }}>
                    <Message.Header>{`From ${announcement.author.firstName}`}</Message.Header>
                    {announcement.content}
                    <br />
                    <p style={{ color: "#666666" }}>
                        Posted{" "}
                        {new Date(announcement.timeUpdated).toLocaleString(
                            "en-us"
                        )}
                    </p>
                </Message.Content>
            </Message>
        </>
    );
};

const calcNumUnread = (
    announcements: Announcement[],
    latestRead: Date,
    user: BaseUser
) => {
    let unread = 0;
    announcements!.forEach((a) => {
        const date = new Date(a.timeUpdated);
        if (date > latestRead && a.author.username !== user.username) {
            unread += 1;
        }
    });
    return unread;
};

export default function Announcements(props: AnnouncementsProps) {
    const { courseId, initialAnnouncements, staff, play } = props;
    const { user } = useContext(AuthUserContext);
    const { data: announcements, mutate } = useAnnouncements(
        courseId,
        initialAnnouncements
    );
    const [numUnread, setNumUnread] = useState(announcements!.length);
    const [latestRead, setLatestRead] = useState<Date>(new Date(0));

    useEffect(() => {
        const unread = calcNumUnread(announcements!, latestRead, user!);
        setNumUnread(unread);
        if (!staff && unread > 0) {
            play.current(`You have ${unread} unread announcements`);
        }
    }, [announcements, latestRead, play, staff, user]);

    const [open, setOpen] = useState(false);
    const [newState, setNewState] = useState<boolean>(false);
    const [deleteState, setDeleteState] = useState<ModalState>({
        isOpen: false,
    });
    const [editState, setEditState] = useState<ModalState>({ isOpen: false });

    return (
        <>
            {deleteState.isOpen && (
                <DeleteAnnouncementModal
                    announcement={deleteState.announcement}
                    setModalState={setDeleteState}
                    mutate={mutate}
                />
            )}
            {newState && (
                <NewAnnouncementModal
                    setModalState={setNewState}
                    mutate={mutate}
                    courseId={courseId}
                />
            )}
            {editState.isOpen && (
                <EditAnnouncementModal
                    announcement={editState.announcement}
                    setModalState={setEditState}
                    mutate={mutate}
                />
            )}
            <div style={{ position: "relative" }}>
                <Accordion fluid styled>
                    <Accordion.Title
                        style={{
                            height: "3.5rem",
                            display: "flex",
                            alignItems: "center",
                        }}
                        active={open}
                        onClick={() => {
                            setOpen(!open);
                            let newDate = latestRead;
                            announcements!.forEach((a) => {
                                const date = new Date(a.timeUpdated);
                                if (date > newDate) {
                                    newDate = date;
                                }
                            });
                            setLatestRead(newDate);
                        }}
                    >
                        <Icon name="dropdown" />
                        {announcements!.length} Active Announcements (
                        {numUnread} Unread)
                    </Accordion.Title>
                    {staff && (
                        <Button
                            style={{
                                position: "absolute",
                                right: "0.8rem",
                                top: "0.5rem",
                            }}
                            onClick={() => setNewState(true)}
                            primary
                        >
                            <Icon name="plus" />
                            Create New
                        </Button>
                    )}
                    <Accordion.Content active={open}>
                        {announcements!.map((a) => (
                            <AnnouncementMessage
                                setEditState={setEditState}
                                setDeleteState={setDeleteState}
                                announcement={a}
                                key={a.id}
                                staff={staff}
                            />
                        ))}
                        {announcements!.length === 0 && (
                            <p style={{ textAlign: "center" }}>
                                Nothing to see here
                            </p>
                        )}
                    </Accordion.Content>
                </Accordion>
            </div>
        </>
    );
}
