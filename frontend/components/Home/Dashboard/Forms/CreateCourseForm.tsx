import React from "react";
import "../../../Course/CourseSettings/CourseForm.module.css";

import { Form } from "semantic-ui-react";
import AsyncSelect from "react-select/async";
import { Semester } from "../../../../types";
import { getSemesters } from "../../../../hooks/data-fetching/course";

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
interface CreateCourseFormProps {
    changeFunc: (a: any, b: any) => void; // TODO: restrict this
    check: number;
    vcChangeFunc: (a: any, b: any) => void; // TODO: restrict this
}
const CreateCourseForm = (props: CreateCourseFormProps) => {
    const { changeFunc, check, vcChangeFunc } = props;
    return (
        <Form>
            <Form.Field required>
                <label htmlFor="dept-input">Department</label>
                <Form.Input
                    id="dept-input"
                    className="department-input"
                    name="department"
                    onChange={changeFunc}
                    placeholder="CIS"
                />
            </Form.Field>
            <Form.Field required>
                <label htmlFor="course-code">Course Code</label>
                <Form.Input
                    id="course-code"
                    name="courseCode"
                    onChange={changeFunc}
                    placeholder="121"
                />
            </Form.Field>
            <Form.Field required>
                <label htmlFor="course-title">Course Title</label>
                <Form.Input
                    id="course-title"
                    name="courseTitle"
                    onChange={changeFunc}
                    placeholder="Data Structures and Algorithms"
                />
            </Form.Field>
            <Form.Field required>
                <label htmlFor="select-sem">Semester</label>
                <AsyncSelect
                    id="select-sem"
                    name="semester"
                    styles={{
                        menu: (styles) => ({ ...styles, zIndex: 10 }),
                    }}
                    cacheOptions
                    defaultOptions
                    loadOptions={semesterOptions}
                    placeholder="Search..."
                    onChange={(id) =>
                        changeFunc(undefined, {
                            name: "semester",
                            value: id!.value,
                        })
                    }
                />
            </Form.Field>
            <Form.Field required>
                <label htmlFor="video-radio">Video Chat</label>
                <Form.Group id="video-radio">
                    <Form.Radio
                        label="Require Link"
                        checked={check === 0}
                        name="requireVideoChatUrlOnQuestions"
                        onChange={vcChangeFunc}
                    />
                    <Form.Radio
                        label="Allow Link"
                        checked={check === 1}
                        name="videoChatEnabled"
                        onChange={vcChangeFunc}
                    />
                    <Form.Radio
                        label="No Link"
                        checked={check === 2}
                        name="disableVideoChat"
                        onChange={vcChangeFunc}
                    />
                </Form.Group>
            </Form.Field>
            <Form.Field required>
                <label htmlFor="invite-only">Invite Only?</label>
                <Form.Checkbox
                    id="invite-only"
                    name="inviteOnly"
                    onChange={changeFunc}
                    toggle
                />
            </Form.Field>
            <Form.Field required>
                <label htmlFor="form-role">Your Role</label>
                <Form.Dropdown
                    id="form-role"
                    selection
                    name="createdRole"
                    onChange={changeFunc}
                    options={[
                        {
                            key: "PROFESSOR",
                            value: "PROFESSOR",
                            text: "Professor",
                        },
                        {
                            key: "HEAD_TA",
                            value: "HEAD_TA",
                            text: "Head TA",
                        },
                    ]}
                    placeholder="Role"
                />
            </Form.Field>
        </Form>
    );
};

export default CreateCourseForm;
