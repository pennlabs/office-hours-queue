import { Form } from "semantic-ui-react";

import AsyncSelect from "react-select/async";
import { Course } from "../../../../types";
import { getCourses } from "../../../../hooks/data-fetching/dashboard";

interface AddStudentFormProps {
    changeFunc: (a: any, b: any) => void; // TODO: restrict this
}
const AddStudentForm = (props: AddStudentFormProps) => {
    const { changeFunc } = props;
    const promiseOptions = async (inputValue: string) => {
        if (inputValue.length === 0) {
            return [];
        }
        const courses: Course[] = await getCourses(inputValue);

        return courses
            .filter((course) => !course.archived)
            .map((course) => {
                const suffix = course.isMember ? " - Already Enrolled" : "";
                return {
                    label: `${course.department} ${course.courseCode} (${course.semesterPretty}): ${course.courseTitle}${suffix}`,
                    value: course.id,
                    disabled: course.isMember,
                };
            });
    };

    return (
        <Form>
            <Form.Field>
                <label htmlFor="search-select">
                    Course Name or Course Code
                </label>
                <AsyncSelect
                    id="search-select"
                    cacheOptions
                    defaultOptions
                    loadOptions={promiseOptions}
                    noOptionsMessage={({ inputValue }) =>
                        inputValue.length === 0
                            ? "Search for a course"
                            : "No courses found"
                    }
                    isMulti
                    placeholder="Search..."
                    isOptionDisabled={(option) => option.disabled}
                    onChange={(items) => {
                        changeFunc(undefined, {
                            name: "courseIds",
                            value:
                                items === null
                                    ? []
                                    : // sound because of previous check
                                      items!.map((item) => item.value),
                        });
                    }}
                />
            </Form.Field>
        </Form>
    );
};

export default AddStudentForm;
