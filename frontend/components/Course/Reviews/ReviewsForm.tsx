// import { TextField } from "@material-ui/core";
import { Form } from "semantic-ui-react";
import { useMemo } from "react";
import { Membership } from "../../../types";
import { useTA /* useLeadership */ } from "../../../hooks/data-fetching/course";

interface ReviewsFormProps {
    courseId: number;
    leadership: Membership[];
}

interface StateOption {
    key: number;
    value: string;
    text: string;
}

const ReviewsForm = (props: ReviewsFormProps) => {
    const { courseId, leadership } = props;
    const {
        TAs: taUnsorted,
        isValidating,
        error,
    } = useTA(courseId, leadership);

    const taOptions = useMemo(() => {
        const options: StateOption[] = [];

        for (const ta of taUnsorted) {
            options.push({
                key: ta.id,
                value: `${ta.user.firstName} ${ta.user.lastName}`,
                text: `${ta.user.firstName} ${ta.user.lastName}`,
            });
        }

        return options;
    }, [taUnsorted, isValidating]);

    return (
        <Form autocomplete="off">
            <Form.Group>
                <Form.Field>
                    <label htmlFor="form-search">TA Name</label>
                    <Form.Dropdown
                        id="form-state"
                        selection
                        name="state"
                        clearable
                        placeholder="TA Name"
                        options={taOptions}
                        error={error}
                        loading={isValidating}
                        onChange={(e, { value }) => {
                            /*
                            updateFilter({
                                status: value,
                                page: 1
                            })
                            */
                        }}
                    />
                </Form.Field>
                {/* <Form.Field>
                    <label htmlFor="form-search">Search</label>
                    <Form.Input
                        icon = "search"
                        placeholder = "Search..."
                    />
                </Form.Field> */}
            </Form.Group>
        </Form>
    );
};

export default ReviewsForm;
