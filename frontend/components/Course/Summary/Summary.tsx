// TODO: sort by time asked

import React, { useState } from "react";
import { Segment, Grid, Table, Loader, Pagination } from "semantic-ui-react";
import {
    useQuestions,
    QuestionSummaryFilters,
} from "../../../hooks/data-fetching/questionsummary";
import SummaryForm from "./SummaryForm";
import { useCourse } from "../../../hooks/data-fetching/course";
import { Course } from "../../../types";
import { prettifyQuestionState } from "../../../utils/enums";

const MAX_QUESTIONS_PER_PAGE = 20;
interface SummaryProps {
    course: Course;
}

const Summary = (props: SummaryProps) => {
    const { course: rawCourse } = props;
    const [course, , ,] = useCourse(rawCourse.id, rawCourse);

    const [filterState, setFilterState] = useState<
        Partial<QuestionSummaryFilters>
    >({ page: 1 });

    // TODO: Add initial state
    // TODO: Handle loaders
    const [data, , loading] = useQuestions(course.id, filterState, null);
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
                        {data && data.results && (
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
                                                // TODO: this isn't a good fix
                                                // @ts-ignore
                                                dateStyle: "short",
                                                timeStyle: "short",
                                            })}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {prettifyQuestionState(qs.status)}
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        )}
                        <Table.Footer>
                            {data && (
                                <Table.Row textAlign="right">
                                    <Table.HeaderCell colSpan="6">
                                        <Pagination
                                            activePage={filterState.page}
                                            totalPages={Math.ceil(
                                                data.count /
                                                    MAX_QUESTIONS_PER_PAGE
                                            )}
                                            onPageChange={(
                                                e,
                                                { activePage }
                                            ) => {
                                                setFilterState({
                                                    ...filterState,
                                                    // TODO: ts warning here
                                                    // @ts-ignore
                                                    page: activePage,
                                                });
                                            }}
                                        />
                                    </Table.HeaderCell>
                                </Table.Row>
                            )}
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
