import React, { useState } from "react";
import { Form, Button } from "semantic-ui-react";
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

const SummaryForm = ({ updateFilter, downloadUrl }) => {
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

        updateFilter({
            [fieldName]: value,
            page: 1,
        });
    };

    const [debounce, setDebounce] = useState<NodeJS.Timeout | null>(null);

    return (
        <Form autoComplete="off">
            <Form.Group>
                <Form.Field>
                    <label htmlFor="form-after">After</label>
                    <TextField
                        id="form-after"
                        type="date"
                        onChange={handleChangeTime(true)}
                        InputLabelProps={{ shrink: true }}
                    />
                </Form.Field>
                <Form.Field>
                    <label htmlFor="form-before">Before</label>
                    <TextField
                        id="form-before"
                        type="date"
                        onChange={handleChangeTime(false)}
                        InputLabelProps={{ shrink: true }}
                    />
                </Form.Field>
                <Form.Field>
                    <label htmlFor="form-state">State</label>
                    <Form.Dropdown
                        id="form-state"
                        selection
                        name="state"
                        clearable
                        placeholder="State"
                        options={stateOptions}
                        onChange={(e, { value }) => {
                            updateFilter({
                                status: value,
                                page: 1,
                            });
                        }}
                    />
                </Form.Field>
                <Form.Field>
                    <label htmlFor="form-search">Search</label>
                    <Form.Input
                        id="form-search"
                        icon="search"
                        placeholder="Search..."
                        onChange={(e, { value }) => {
                            if (debounce) {
                                clearTimeout(debounce);
                            }
                            setDebounce(
                                setTimeout(() => {
                                    updateFilter({
                                        search: value,
                                        page: 1,
                                    });
                                }, 1000)
                            );
                        }}
                    />
                </Form.Field>
                <Form.Field style={{ marginLeft: "auto", marginTop: "auto" }}>
                    <Button
                        content="Download"
                        download
                        primary
                        href={downloadUrl}
                    />
                </Form.Field>
            </Form.Group>
        </Form>
    );
};

export default SummaryForm;
