import { Segment, Header, Grid } from "semantic-ui-react";
import AccountForm from "./AccountForm";

const AccountSettings = () => {
    return (
        <Grid.Column width={13}>
            <Grid.Row>
                <Segment basic>
                    <Header as="h2">Account Settings</Header>
                </Segment>
            </Grid.Row>
            <Grid.Row>
                <Segment basic>
                    <AccountForm />
                </Segment>
            </Grid.Row>
        </Grid.Column>
    );
};

export default AccountSettings;
