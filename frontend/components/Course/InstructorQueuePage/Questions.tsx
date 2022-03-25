import { Grid, Message } from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import _ from "lodash";
import QuestionCard from "./QuestionCard";
import { Question, UserMembership } from "../../../types";

interface QuestionsProps {
    questions: Question[];
    active: boolean;
    mutate: mutateResourceListFunction<Question>;
    notifs: boolean;
    setNotifs: (boolean) => void;
    membership: UserMembership;
}
const Questions = (props: QuestionsProps) => {
    const { questions, mutate, active, notifs, setNotifs, membership } = props;
    return (
        <>
            {questions &&
                questions.length !== 0 &&
                _.sortBy(questions, "orderKey").map((question) => (
                    <Grid.Row key={question.id}>
                        <QuestionCard
                            key={question.id}
                            question={question}
                            mutate={mutate}
                            notifs={notifs}
                            setNotifs={setNotifs}
                            membership={membership}
                        />
                    </Grid.Row>
                ))}
            {active && questions && questions.length === 0 && (
                <Grid.Row>
                    <Grid.Column>
                        <Message
                            icon="folder open outline"
                            header="Empty Queue"
                            content="This queue currently has no questions, or no questions match your tag filter."
                        />
                    </Grid.Column>
                </Grid.Row>
            )}
            {!active && questions.length === 0 && (
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
            )}
        </>
    );
};

export default Questions;
