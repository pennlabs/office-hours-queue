import React, { useState } from "react";
import {
    Accordion,
    Dropdown,
    Form,
    Modal,
    Message,
    Icon,
    Button,
    Container,
} from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import { Announcement } from "../../types";
import {
    useAnnouncements,
    createAnnouncement,
} from "../../hooks/data-fetching/course";

interface AnnouncementsProps {
    courseId: number;
    initialAnnouncements: Announcement[];
    staff: boolean;
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
            <Modal.Actions>
                <Button onClick={() => setModalState({ isOpen: false })}>
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
                        mutate();
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
                                Delete
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                )}
                <Icon name="comment alternate outline" />
                <Message.Content>
                    <Message.Header>{`From ${announcement.author.firstName}`}</Message.Header>
                    {announcement.content}
                </Message.Content>
            </Message>
        </>
    );
};

export default function Announcements(props: AnnouncementsProps) {
    const { courseId, initialAnnouncements, staff } = props;

    const { data: announcements, mutate } = useAnnouncements(
        courseId,
        initialAnnouncements
    );
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
                        onClick={() => setOpen(!open)}
                    >
                        <Icon name="dropdown" />
                        Active Announcements
                    </Accordion.Title>
                    <Button
                        style={{
                            position: "absolute",
                            right: "0.8rem",
                            top: "0.5rem",
                        }}
                        onClick={() => setNewState(true)}
                        primary
                    >
                        Create New
                    </Button>
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
                    </Accordion.Content>
                </Accordion>
            </div>
        </>
    );
}
