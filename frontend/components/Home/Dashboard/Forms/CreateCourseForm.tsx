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
                <label>Department</label>
                <Form.Input
                    className="department-input"
                    name="department"
                    onChange={changeFunc}
                    placeholder="CIS"
                />
            </Form.Field>
            <Form.Field required>
                <label>Course Code</label>
                <Form.Input
                    name="courseCode"
                    onChange={changeFunc}
                    placeholder="121"
                />
            </Form.Field>
            <Form.Field required>
                <label>Course Title</label>
                <Form.Input
                    name="courseTitle"
                    onChange={changeFunc}
                    placeholder="Data Structures and Algorithms"
                />
            </Form.Field>
            <Form.Field required>
                <label>Semester</label>
                <AsyncSelect
                    name="semester"
                    cacheOptions
                    defaultOptions
                    loadOptions={semesterOptions}
                    placeholder="Search..."
                    onChange={(id) =>
                        changeFunc(undefined, {
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
            </Form.Field>
            <Form.Field required>
                <label>Invite Only?</label>
                <Form.Radio name="inviteOnly" onChange={changeFunc} toggle />
            </Form.Field>
            <Form.Field required>
                <label>Your Role</label>
                <Form.Dropdown
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
