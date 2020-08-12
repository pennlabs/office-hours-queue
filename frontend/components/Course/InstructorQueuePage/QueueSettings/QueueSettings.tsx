import React, { useState, useEffect } from "react";
import {
    Grid,
    Segment,
    Header,
    Tab,
    Button,
    Dimmer,
    Loader,
} from "semantic-ui-react";
import { linkifyComponentDecorator } from "../../../../utils";
// import Linkify from 'react-linkify';
import QueueForm from "./QueueForm";
import TagForm from "./TagForm";

const QueueSettings = props => {
    /* STATE */
    const [queue, setQueue] = useState(props.queue);

    /* PROPS UPDATE */
    useEffect(() => {
        setQueue(props.queue);
    }, [props.queue]);

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
                                        {/* <Linkify componentDecorator={linkifyComponentDecorator}> */}
                                        {queue.description}
                                        {/* </Linkify> */}
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
                    <Tab
                        menu={{ pointing: true, secondary: true }}
                        panes={[
                            {
                                menuItem: "General",
                                render: () => {
                                    return (
                                        <QueueForm
                                            refetch={props.refetch}
                                            queue={queue}
                                            backFunc={props.backFunc}
                                        />
                                    );
                                },
                            },
                            {
                                menuItem: "Tags",
                                render: () => {
                                    return (
                                        <TagForm
                                            refetch={props.refetch}
                                            queue={queue}
                                        />
                                    );
                                },
                            },
                        ]}
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
