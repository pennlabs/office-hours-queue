import {
    Grid,
    Segment,
    Header,
    Button,
    Dimmer,
    Loader,
} from "semantic-ui-react";
import { mutateResourceListFunction } from "@pennlabs/rest-hooks/dist/types";
import QueueForm from "./QueueForm";
import { Queue } from "../../../../types";
import LinkedText from "../../../common/ui/LinkedText";

interface QueueSettingsProps {
    queue?: Queue;
    mutate: mutateResourceListFunction<Queue>;
    backFunc: () => void;
}
const QueueSettings = (props: QueueSettingsProps) => {
    const { queue, mutate, backFunc } = props;

    return queue ? (
        <Grid.Column>
            <Grid.Row>
                <Segment basic>
                    <Grid columns="equal">
                        <Grid.Row>
                            <Grid.Column textAlign="left">
                                <Header as="h3">
                                    {queue.name}
                                    <Header.Subheader>
                                        <LinkedText text={queue.description} />
                                    </Header.Subheader>
                                </Header>
                            </Grid.Column>
                            <Grid.Column textAlign="right">
                                <Header as="h3">
                                    <Button
                                        content="Back"
                                        onClick={() => props.backFunc()}
                                    />
                                </Header>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            </Grid.Row>
            <Grid.Row>
                <Segment basic>
                    <QueueForm
                        mutate={mutate}
                        queue={queue}
                        backFunc={backFunc}
                    />
                </Segment>
            </Grid.Row>
        </Grid.Column>
    ) : (
        <Dimmer active inverted inline="centered">
            <Loader size="big" inverted />
        </Dimmer>
    );
};

export default QueueSettings;
