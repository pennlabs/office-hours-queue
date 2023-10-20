import { Segment, Header, Grid } from "semantic-ui-react";
import AccountForm from "./AccountForm";
import Footer from "../../common/Footer";

const AccountSettings = () => {
    return (
        <Grid.Column
            width={13}
            style={{ display: "flex", flexDirection: "column" }}
        >
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
            <Footer />
        </Grid.Column>
    );
};

export default AccountSettings;
