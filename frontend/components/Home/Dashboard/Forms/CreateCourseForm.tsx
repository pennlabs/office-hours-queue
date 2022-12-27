import "../../../Course/CourseSettings/CourseForm.module.css";

import { useState } from "react";
import { Form } from "semantic-ui-react";
import AsyncSelect from "react-select/async";
import { Semester } from "../../../../types";
import { getSemesters } from "../../../../hooks/data-fetching/course";
import { COURSE_TITLE_CHAR_LIMIT } from "../../../../constants";

const TERM_SORT_VALUES = {
    FALL: 3,
    SUMMER: 2,
    SPRING: 1,
    WINTER: 0,
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
        .sort((s1, s2) => {
            // Sort by most recent semester
            if (s1.year === s2.year) {
                return TERM_SORT_VALUES[s2.term] - TERM_SORT_VALUES[s1.term];
            }
            return s2.year - s1.year;
        })
        .map((semester) => {
            return {
                label: semester.pretty,
                value: semester.id,
            };
        });
};
interface CreateCourseFormProps {
    changeFunc: (a: any, b: any) => void; // TODO: restrict this
    input: any;
}
const CreateCourseForm = (props: CreateCourseFormProps) => {
    const { changeFunc, input } = props;

    const [courseTitleCharCount, setCourseTitleCharCount] = useState(
        input.courseTitle ? input.courseTitle : 0
    );

    const handleCourseTitleChange = (e, { name, value }) => {
        if (value.length <= COURSE_TITLE_CHAR_LIMIT) {
            setCourseTitleCharCount(value.length);
            changeFunc(e, { name, value });
        }
    };

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
                    value={input.courseTitle}
                    onChange={handleCourseTitleChange}
                    placeholder="Data Structures and Algorithms"
                />
                <div
                    style={{
                        textAlign: "right",
                        color:
                            courseTitleCharCount < COURSE_TITLE_CHAR_LIMIT
                                ? ""
                                : "crimson",
                    }}
                >
                    {`Characters: ${courseTitleCharCount}/${COURSE_TITLE_CHAR_LIMIT}`}
                </div>
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
