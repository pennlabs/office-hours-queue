import React, { MutableRefObject } from "react";
import { Grid, Message } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import _ from "lodash";
import QuestionCard from "./QuestionCard";
import { Question } from "../../../types";

interface QuestionsProps {
    questions: Question[];
    active: boolean;
    mutate: mutateResourceListFunction<Question>;
    play: MutableRefObject<() => void>;
}
const Questions = (props: QuestionsProps) => {
    const { questions, mutate, active, play } = props;
    return (
        <>
            <Grid.Column>
                {questions &&
                    questions.length !== 0 &&
                    _.sortBy(questions, "orderKey").map((question) => (
                        <Grid.Row key={question.id}>
                            <QuestionCard
                                play={play}
                                key={question.id}
                                question={question}
                                mutate={mutate}
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
