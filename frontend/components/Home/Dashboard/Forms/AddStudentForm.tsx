import React from "react";
import { Form } from "semantic-ui-react";

import AsyncSelect from "react-select/async";
import { getCourses, Course } from "../DashboardRequests";

const AddStudentForm = (props) => {
    const promiseOptions = async (inputValue: string) => {
        if (inputValue.length === 0) {
            return [];
        }
        const courses: Course[] = await getCourses(inputValue);

        return courses.map((course) => {
            const suffix = course.isMember ? " - Already Enrolled" : "";
            return {
                label: `${course.department} ${course.courseCode} (${course.semester})${suffix}`,
                value: course.id,
                disabled: course.isMember,
            };
        });
    };

    return (
        <Form>
            <Form.Field>
                <label>Course Name or Course Code</label>
                <AsyncSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={promiseOptions}
                    isMulti
                    placeholder="Search..."
                    isOptionDisabled={(option) => option.disabled}
                    onChange={(items) => {
                        props.changeFunc(undefined, {
                            name: "courseIds",
                            value:
                                items === null
                                    ? []
                                    : items.map((item) => item.value),
                        });
                    }}
                />
            </Form.Field>
        </Form>
    );
};

export default AddStudentForm;
