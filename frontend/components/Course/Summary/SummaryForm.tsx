import React, { useState } from "react";
import { Form } from "semantic-ui-react";
import TextField from "@material-ui/core/TextField";
import { QuestionStatus } from "../../../types";

const formatState = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

// https://www.petermorlion.com/iterating-a-typescript-enum/
function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
    return Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[];
}

interface StateOption {
    key: string;
    value: QuestionStatus;
    text: string;
}

const stateOptions: StateOption[] = [];
for (const state of enumKeys(QuestionStatus)) {
    stateOptions.push({
        key: state,
        value: QuestionStatus[state],
        text: formatState(state),
    });
}

const SummaryForm = ({ filterState, setFilterState }) => {
    const handleChangeTime = (isAfter) => (e) => {
        const time = e.target.value;
        let value;
        let fieldName;
        if (isAfter) {
            value = time === "" ? "" : `${time}T00:00:00`;
            fieldName = "timeAskedGt";
        } else {
            value = time === "" ? "" : `${time}T22:59:59`;
            fieldName = "timeAskedLt";
        }

        setFilterState({
            ...filterState,
            [fieldName]: value,
            page: 1,
        });
    };

    const [debounce, setDebounce] = useState(null);

    return (
        <Form>
            <Form.Group>
                <Form.Field>
                    <label>After</label>
                    <TextField
                        type="date"
                        onChange={handleChangeTime(true)}
                        InputLabelProps={{ shrink: true }}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Before</label>
                    <TextField
                        type="date"
                        onChange={handleChangeTime(false)}
                        InputLabelProps={{ shrink: true }}
                    />
                </Form.Field>
                <Form.Field>
                    <label>State</label>
                    <Form.Dropdown
                        selection
                        name="state"
                        clearable
                        placeholder="State"
                        options={stateOptions}
                        onChange={(e, { value }) => {
                            setFilterState({
                                ...filterState,
                                status: value,
                                page: 1,
                            });
                        }}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Search</label>
                    <Form.Input
                        icon="search"
                        placeholder="Search..."
                        onChange={(e, { value }) => {
                            if (debounce) {
                                clearTimeout(debounce);
                            }
                            setDebounce(
                                setTimeout(() => {
                                    setFilterState({
                                        ...filterState,
                                        search: value,
                                        page: 1,
                                    });
                                }, 1000)
                            );
                        }}
                    />
                </Form.Field>
            </Form.Group>
        </Form>
    );
};

export default SummaryForm;
