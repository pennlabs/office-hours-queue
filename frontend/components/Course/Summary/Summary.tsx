// TODO: sort by time asked

import React from "react";
import { Segment, Grid, Table, Loader, Pagination } from "semantic-ui-react";
import {
    useQuestions,
    QuestionListResult,
} from "../../../hooks/data-fetching/questionsummary";
import SummaryForm from "./SummaryForm";
import { useCourse } from "../../../hooks/data-fetching/course";
import { Course, User } from "../../../types";
import { prettifyQuestionState } from "../../../utils/enums";

const MAX_QUESTIONS_PER_PAGE = 20;
interface SummaryProps {
    course: Course;
    questionListResult: QuestionListResult;
}

const Summary = (props: SummaryProps) => {
    const { course: rawCourse, questionListResult } = props;
    const [course, , ,] = useCourse(rawCourse.id, rawCourse);

    const getFullName = (user: User) => `${user.firstName} ${user.lastName}`;

    // TODO: Handle loaders
    const { data, isValidating: loading, updateFilter, filters } = useQuestions(
        course.id,
        questionListResult
    );
    return (
        <div>
            <Grid.Row>
                <Segment basic>
                    <SummaryForm updateFilter={updateFilter} />
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
                                            {getFullName(qs.askedBy)}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {qs.respondedToBy &&
                                                getFullName(qs.respondedToBy)}
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
                                            activePage={filters.page}
                                            totalPages={Math.ceil(
                                                data.count /
                                                    MAX_QUESTIONS_PER_PAGE
                                            )}
                                            onPageChange={(
                                                _,
                                                { activePage }
                                            ) => {
                                                let parsedPage: number;
                                                if (
                                                    typeof activePage ===
                                                    "string"
                                                ) {
                                                    parsedPage = parseInt(
                                                        activePage,
                                                        10
                                                    );
                                                } else {
                                                    parsedPage = activePage;
                                                }

                                                updateFilter({
                                                    page: parsedPage,
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
