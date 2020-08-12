import React from "react";
import { Grid, Message } from "semantic-ui-react";
import _ from "lodash";
import QuestionCard from "./QuestionCard";

const Questions = props => {
    return [
        <Grid.Column>
            {props.questions &&
                props.questions.length !== 0 &&
                _.sortBy(props.questions, "orderKey").map(question => (
                    <Grid.Row>
                        <QuestionCard
                            key={question.id}
                            question={question}
                            refetch={props.refetch}
                            userId={props.userId}
                        />
                    </Grid.Row>
                ))}
        </Grid.Column>,
        props.active && props.questions && props.questions.length === 0 && (
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
        ),
        !props.active && props.questions.length === 0 && (
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
        ),
    ];
};

export default Questions;
