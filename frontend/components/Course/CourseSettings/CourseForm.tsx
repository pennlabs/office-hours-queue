import React, { useState } from "react";
import "./CourseForm.module.css";

import { Form, Button, Modal } from "semantic-ui-react";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import AsyncSelect from "react-select/async";
import { useRouter } from "next/router";
import { getSemesters, updateCourse } from "../CourseRequests";
import { Semester } from "../../../types";

const CourseForm = (props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const videoChatNum = (course) => {
        if (course.requireVideoChatUrlOnQuestions) return 0;
        if (course.videoChatEnabled) return 1;
        return 2;
    };

    const [input, setInput] = useState({
        inviteOnly: props.course.inviteOnly,
        requireVideoChatUrlOnQuestions:
            props.course.requireVideoChatUrlOnQuestions,
        videoChatEnabled: props.course.videoChatEnabled,
        department: props.course.department,
        courseCode: props.course.courseCode,
        courseTitle: props.course.courseTitle,
        semester: props.course.semester,
    });
    const [check, setCheck] = useState(videoChatNum(props.course));
    const [success, setSuccess] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [error, setError] = useState(false);
    const [archiveError, setArchiveError] = useState(false);
    const [open, setOpen] = useState(false);

    /* HANDLER FUNCTIONS */

    const handleInputChange = (e, { name, value }) => {
        input[name] = name === "inviteOnly" ? !input[name] : value;
        setInput(input);
        setDisabled(
            !input.department ||
                !input.courseCode ||
                !input.courseTitle ||
                !input.semester ||
                (input.department === props.course.department &&
                    input.courseCode === props.course.courseCode &&
                    input.courseTitle === props.course.courseTitle &&
                    input.inviteOnly === props.course.inviteOnly &&
                    input.semester === props.course.semester)
        );
    };

    const handleVideoChatInputChange = (e, { name }) => {
        setDisabled(false);
        switch (name) {
            case "requireVideoChatUrlOnQuestions": {
                input[name] = true;
                input.videoChatEnabled = true;
                setInput(input);
                setCheck(videoChatNum(input));
                break;
            }
            case "videoChatEnabled": {
                input[name] = true;
                input.requireVideoChatUrlOnQuestions = false;
                setInput(input);
                setCheck(videoChatNum(input));
                break;
            }
            case "disableVideoChat": {
                input.requireVideoChatUrlOnQuestions = false;
                input.videoChatEnabled = false;
                setInput(input);
                setCheck(videoChatNum(input));
                break;
            }
            default:
        }
    };

    const onSubmit = async () => {
        try {
            setLoading(true);
            await updateCourse(props.course.id, input);
            await props.refetch();
            setLoading(false);
            setSuccess(true);
            setDisabled(true);
        } catch (e) {
            setLoading(false);
            setError(true);
        }
    };

    const onArchived = async () => {
        try {
            setLoading(true);
            await updateCourse(props.course.id, { archived: true });
            await props.refetch();
            setLoading(false);
            setOpen(false);
            router.replace("/");
        } catch (e) {
            setLoading(false);
            setArchiveError(true);
        }
    };

    const semesterOptions = async (inputValue: string) => {
        const semesters: Semester[] = await getSemesters();
        return semesters
            .filter(
                (semester) =>
                    semester.pretty
                        .toLowerCase()
                        .includes(inputValue.toLowerCase()) ||
                    inputValue.length === 0
            )
            .map((semester) => {
                return {
                    label: semester.pretty,
                    value: semester.id,
                };
            });
    };

    return (
        <Form>
            <Form.Field required>
                <label>Department</label>
                <Form.Input
                    className="department-input"
                    defaultValue={props.course.department}
                    name="department"
                    disabled={loading}
                    onChange={handleInputChange}
                />
            </Form.Field>
            <Form.Field required>
                <label>Course Code</label>
                <Form.Input
                    defaultValue={props.course.courseCode}
                    name="courseCode"
                    disabled={loading}
                    onChange={handleInputChange}
                />
            </Form.Field>
            <Form.Field required>
                <label>Course Title</label>
                <Form.Input
                    defaultValue={props.course.courseTitle}
                    name="courseTitle"
                    disabled={loading}
                    onChange={handleInputChange}
                />
            </Form.Field>
            <Form.Field required>
                <label>Semester</label>
                <AsyncSelect
                    name="semester"
                    disabled={loading}
                    cacheOptions
                    defaultOptions
                    defaultInputValue={props.course.semesterPretty}
                    loadOptions={semesterOptions}
                    placeholder="Search..."
                    onChange={(id) =>
                        handleInputChange(undefined, {
                            name: "semester",
                            value: id.value,
                        })
                    }
                />
            </Form.Field>
            <Form.Field required>
                <label>Video Chat</label>
                <Form.Radio
                    label="Require Link"
                    checked={check === 0}
                    name="requireVideoChatUrlOnQuestions"
                    disabled={loading}
                    onChange={handleVideoChatInputChange}
                />
                <Form.Radio
                    label="Allow Link"
                    checked={check === 1}
                    name="videoChatEnabled"
                    disabled={loading}
                    onChange={handleVideoChatInputChange}
                />
                <Form.Radio
                    label="No Link"
                    checked={check === 2}
                    name="disableVideoChat"
                    disabled={loading}
                    onChange={handleVideoChatInputChange}
                />
            </Form.Field>
            <Form.Field required>
                <label>Invite Only?</label>
                <Form.Radio
                    defaultChecked={props.course.inviteOnly}
                    name="inviteOnly"
                    disabled={loading}
                    toggle
                    onChange={handleInputChange}
                />
            </Form.Field>
            <Button
                color="blue"
                type="submit"
                disabled={disabled || loading}
                loading={loading}
                onClick={onSubmit}
            >
                Save
            </Button>
            <Modal
                open={open}
                trigger={
                    <Button type="submit" onClick={() => setOpen(true)}>
                        Archive
                    </Button>
                }
            >
                <Modal.Header>Archive Course</Modal.Header>
                <Modal.Content>
                    You are about to archive{" "}
                    <b>
                        {props.course.department} {props.course.courseCode}
                    </b>
                    .
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        content="Cancel"
                        disabled={loading}
                        onClick={() => setOpen(false)}
                    />
                    <Button
                        content="Archive"
                        onClick={onArchived}
                        disabled={loading}
                        loading={loading}
                        color="red"
                    />
                </Modal.Actions>
            </Modal>
            <Snackbar
                open={success}
                autoHideDuration={6000}
                onClose={() => setSuccess(false)}
            >
                <Alert severity="success" onClose={() => setSuccess(false)}>
                    <span>
                        <b>{`${props.course.department} ${props.course.courseCode}`}</b>{" "}
                        successfully updated
                    </span>
                </Alert>
            </Snackbar>
            <Snackbar
                open={error}
                autoHideDuration={6000}
                onClose={() => setError(false)}
            >
                <Alert severity="error" onClose={() => setError(false)}>
                    <span>
                        There was an error updating{" "}
                        <b>{`${props.course.department} ${props.course.courseCode}`}</b>
                    </span>
                </Alert>
            </Snackbar>
            <Snackbar
                open={archiveError}
                autoHideDuration={6000}
                onClose={() => setArchiveError(false)}
            >
                <Alert severity="error" onClose={() => setArchiveError(false)}>
                    <span>
                        There was an error archiving{" "}
                        <b>{`${props.course.department} ${props.course.courseCode}`}</b>
                    </span>
                </Alert>
            </Snackbar>
        </Form>
    );
};

export default CourseForm;
