// WIP
// TODO: sort by time asked

import React, { useState, useMemo } from "react";
import {
    Segment,
    Grid,
    Table,
    Dimmer,
    Loader,
    Button,
} from "semantic-ui-react";
import _ from "lodash";
import {
    useQuestions,
    QuestionSummaryFilters,
} from "../../../hooks/data-fetching/questionsummary";
import SummaryForm from "./SummaryForm";

const Summary = ({ course }) => {
    const [filterState, setFilterState] = useState<
        Partial<QuestionSummaryFilters>
    >({ page: 1 });

    // TODO: Add initial state
    const [data, error, loading] = useQuestions(course.id, filterState);

    return (
        <div>
            <Grid.Row>
                <Segment basic>
                    <SummaryForm
                        setFilterState={setFilterState}
                        filterState={filterState}
                    />
                    <Table sortable celled padded striped>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell width={2}>
                                    Student
                                </Table.HeaderCell>
                                <Table.HeaderCell width={2}>
                                    Instructor
                                </Table.HeaderCell>
                                <Table.HeaderCell width={4}>
                                    Question
                                </Table.HeaderCell>
                                <Table.HeaderCell width={2}>
                                    Time Asked
                                </Table.HeaderCell>
                                <Table.HeaderCell width={1}>
                                    State
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        {loading && <Loader size="big" inverted />}
                        {data && (
                            <Table.Body>
                                {data.results.map((qs) => (
                                    <Table.Row>
                                        <Table.Cell>
                                            {qs.askedBy?.firstName}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {qs.respondedToBy?.firstName}
                                        </Table.Cell>
                                        <Table.Cell>{qs.text}</Table.Cell>
                                        <Table.Cell>
                                            {new Date(
                                                qs.timeAsked
                                            ).toLocaleString("en-US", {
                                                dateStyle: "short",
                                                timeStyle: "short",
                                            })}
                                        </Table.Cell>
                                        <Table.Cell>{qs.state}</Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        )}
                        <Table.Footer>
                            <Table.Row textAlign="right">
                                <Table.HeaderCell colSpan="6">
                                    {/* <Button
                                        primary
                                        loading={loading}
                                        content="Show More"
                                        icon="angle down"
                                        disabled={!hasNextPage}
                                        onClick={nextPage}
                                    /> */}
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Footer>
                    </Table>
                    <div>
                        {data &&
                            `${data.count} question${
                                data.count === 1 ? "" : "s"
                            }`}
                    </div>
                </Segment>
            </Grid.Row>
        </div>
    );
};

export default Summary;
