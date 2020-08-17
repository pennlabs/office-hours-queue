import React from "react";
import { Grid, Message } from "semantic-ui-react";
import _ from "lodash";
import QuestionCard from "./QuestionCard";
import { mutateFunction, Question } from "../../../types";

interface QuestionsProps {
    questions: Question[];
    courseId: number;
    queueId: number;
    active: boolean;
    refetch: mutateFunction<Question[]>;
}
const Questions = (props: QuestionsProps) => {
    const { questions, refetch, active, courseId, queueId } = props;
    return (
        <>
            <Grid.Column>
                {questions &&
                    questions.length !== 0 &&
                    _.sortBy(questions, "orderKey").map((question) => (
                        <Grid.Row>
                            <QuestionCard
                                key={question.id}
                                question={question}
                                courseId={courseId}
                                queueId={queueId}
                                refetch={refetch}
                            />
                        </Grid.Row>
                    ))}
            </Grid.Column>
            {active && questions && questions.length === 0 && (
                <Grid>
                    <Grid.Row>
                        <Grid.Column>
                            <Message
                                icon="folder open outline"
                                header="Empty Queue"
                                content="This queue currently has no questions, or no questions match your tag filter."
                            />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            )}
            {!active && questions.length === 0 && (
                <Grid>
                    <Grid.Row>
                        <Grid.Column>
                            <Message
                                icon="calendar times outline"
                                header="Closed Queue"
                                content="This queue is currently closed. You can open it by using the 'open' button above."
                                error
                            />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            )}
        </>
    );
};

export default Questions;
