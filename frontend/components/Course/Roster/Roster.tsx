import React, { useState, useEffect, useContext } from "react";
import { Segment, Header, Grid, Table } from "semantic-ui-react";
import RosterForm from "./RosterForm";
import RemoveButton from "./RemoveButton";
import InviteModal from "./Invites/InviteModal";
import _ from "lodash";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";

import { prettifyRole, isLeadershipRole } from "../../../utils/enums";
import ChangeRoleDropdown from "./ChangeRoleDropdown";
import {
    useInvitedMembers,
    useMembers,
    useLeadership,
} from "../CourseRequests";
import { AuthUserContext } from "../../../context/auth";

const Roster = (props) => {
    // TODO: get initial props on this
    const [memberships, error, loading, refetch] = useMembers(props.course.id);

    const { user: initialUser } = useContext(AuthUserContext);
    const [leader, leaderError, leaderLoading, leaderMutate] = useLeadership(
        props.course.id,
        initialUser
    );
    /* STATE */
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [
        invitedMembers,
        invitedError,
        invitedLoading,
        invitedMutate,
    ] = useInvitedMembers(props.course.id);

    const [open, setOpen] = useState(false);
    const [invitedTableState, setInvitedTableState] = useState({
        direction: "ascending",
        column: "email",
    });
    const [tableState, setTableState] = useState({
        direction: "ascending",
        column: "fullName",
    });
    const [showInvited, setShowInvited] = useState(false);
    const [toast, setToast] = useState({
        open: false,
        success: true,
        message: "",
    });

    /* MODAL FUNCTIONS */
    const triggerModal = () => {
        setOpen(!open);
    };

    /* TABLE FUNCTIONS */
    const handleSort = (clickedColumn) => {
        if (tableState.column !== clickedColumn) {
            setTableState({
                column: clickedColumn,
                direction: "ascending",
            });
        } else {
            setTableState({
                column: tableState.column,
                direction:
                    tableState.direction === "ascending"
                        ? "descending"
                        : "ascending",
            });
        }
    };

    const handleInvitedSort = (clickedColumn) => {
        if (invitedTableState.column !== clickedColumn) {
            setInvitedTableState({
                column: clickedColumn,
                direction: "ascending",
            });
        } else {
            setInvitedTableState({
                column: invitedTableState.column,
                direction:
                    invitedTableState.direction === "ascending"
                        ? "descending"
                        : "ascending",
            });
        }
    };

    /* FILTER USERS BASED ON INPUT */
    const filterUsers = (input) => {
        const newFilteredUsers = memberships.filter((membership) => {
            const role = membership.kind.toLowerCase();
            return (
                (membership.user.firstName
                    .toLowerCase()
                    .includes(input.search) ||
                    membership.user.lastName
                        .toLowerCase()
                        .includes(input.search) ||
                    membership.user.email
                        .toLowerCase()
                        .includes(input.search) ||
                    role.includes(input.search)) &&
                (!input.role || role === input.role)
            );
        });
        setFilteredUsers(newFilteredUsers);
        setTableState({ direction: "ascending", column: "fullName" });
    };

    const closeModal = async () => {
        await refetch();
        triggerModal();
    };

    /* LOAD DATA */

    const isOnlyOneLeadership =
        memberships.filter((membership) => isLeadershipRole(membership.kind))
            .length < 2;

    // TODO: this isn't a great way of doing this. Look into getServerSideProps or something else to get data
    useEffect(() => {
        setFilteredUsers(memberships);
    }, [memberships.length]);

    /* TOAST */
    const setRosterUpdateToast = () => {
        setToast({
            open: true,
            success: true,
            message: "Roster successfully updated",
        });
    };

    const setUserRemovedToast = (name) => {
        setToast({
            open: true,
            success: true,
            message: `${name} successfully removed`,
        });
    };

    const setInviteRevokedToast = () => {
        setToast({
            open: true,
            success: true,
            message: `Invitation successfully revoked`,
        });
    };

    const setInviteResendToast = () => {
        setToast({
            open: true,
            success: true,
            message: `Invitation successfully resent`,
        });
    };

    const setChangeRoleToast = () => {
        setToast({
            open: true,
            success: true,
            message: `Role successfully updated`,
        });
    };

    const closeToast = () => {
        setToast({
            open: false,
            success: true,
            message: "",
        });
    };

    const onRemoveSuccess = async (name) => {
        setUserRemovedToast(name);
        await refetch();
    };

    const onRevokeSuccess = async () => {
        setInviteRevokedToast();
        await invitedMutate();
    };

    const onRoleChangeSuccess = async () => {
        setChangeRoleToast();
        await refetch();
    };

    // TODO: mutate doesn't appear to immediately update the data
    return (
        <div>
            {memberships && (
                <InviteModal
                    open={open}
                    closeFunc={closeModal}
                    courseId={props.course.id}
                    successFunc={setRosterUpdateToast}
                    setToast={setToast}
                    users={memberships}
                />
            )}
            <Grid.Row>
                {memberships && (
                    <Segment basic>
                        <RosterForm
                            showShowInvitedButton={invitedMembers.length > 0}
                            showInviteButton={leader}
                            invitedShown={showInvited}
                            filterFunc={filterUsers}
                            inviteFunc={triggerModal}
                            showInvitedFunc={() => {
                                setShowInvited(!showInvited);
                            }}
                        />
                    </Segment>
                )}
            </Grid.Row>
            {/* TODO: sorting isn't working for either table */}
            <Grid.Row>
                {showInvited && invitedMembers.length > 0 && (
                    <Segment basic>
                        <Grid.Row>
                            <Header as="h3">Invited Users</Header>
                        </Grid.Row>
                        <Table sortable celled padded selectable striped>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell
                                        sorted={
                                            invitedTableState.column === "email"
                                                ? invitedTableState.direction
                                                : null
                                        }
                                        onClick={() =>
                                            handleInvitedSort("email")
                                        }
                                        width={3}
                                    >
                                        Email
                                    </Table.HeaderCell>
                                    <Table.HeaderCell
                                        sorted={
                                            invitedTableState.column === "role"
                                                ? invitedTableState.direction
                                                : null
                                        }
                                        onClick={() =>
                                            handleInvitedSort("role")
                                        }
                                        width={2}
                                    >
                                        Role
                                    </Table.HeaderCell>
                                    {leader && (
                                        <Table.HeaderCell
                                            textAlign="center"
                                            width={1}
                                        >
                                            Revoke
                                        </Table.HeaderCell>
                                    )}
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {_.orderBy(
                                    invitedMembers,
                                    invitedTableState.direction === "ascending"
                                        ? "asc"
                                        : "desc"
                                ).map((invitedMember) => (
                                    <Table.Row>
                                        <Table.Cell>
                                            {invitedMember.email}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {prettifyRole(invitedMember.kind)}
                                        </Table.Cell>
                                        {leader && (
                                            <Table.Cell textAlign="center">
                                                <RemoveButton
                                                    courseId={props.course.id}
                                                    id={invitedMember.id}
                                                    isInvited={true}
                                                    successFunc={
                                                        onRevokeSuccess
                                                    }
                                                />
                                            </Table.Cell>
                                        )}
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </Segment>
                )}
            </Grid.Row>
            <Grid.Row>
                {memberships && (
                    <Segment basic>
                        <Table sortable celled padded selectable striped>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell
                                        sorted={
                                            tableState.column === "fullName"
                                                ? tableState.direction
                                                : null
                                        }
                                        onClick={() => handleSort("fullName")}
                                        width={3}
                                    >
                                        Full Name
                                    </Table.HeaderCell>
                                    <Table.HeaderCell
                                        sorted={
                                            tableState.column === "email"
                                                ? tableState.direction
                                                : null
                                        }
                                        onClick={() => handleSort("email")}
                                        width={4}
                                    >
                                        Email
                                    </Table.HeaderCell>
                                    <Table.HeaderCell
                                        sorted={
                                            tableState.column === "role"
                                                ? tableState.direction
                                                : null
                                        }
                                        onClick={() => handleSort("role")}
                                        width={2}
                                    >
                                        Role
                                    </Table.HeaderCell>
                                    {leader && (
                                        <Table.HeaderCell width={1}>
                                            Remove
                                        </Table.HeaderCell>
                                    )}
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {_.orderBy(
                                    filteredUsers,
                                    tableState.column,
                                    tableState.direction === "ascending"
                                        ? "asc"
                                        : "desc"
                                ).map((membership) => (
                                    <Table.Row key={membership.id}>
                                        <Table.Cell>
                                            {membership.user.firstName}{" "}
                                            {membership.user.lastName}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {membership.user.email}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {!leader ||
                                            membership.kind === "STUDENT" ? (
                                                prettifyRole(membership.kind)
                                            ) : (
                                                <ChangeRoleDropdown
                                                    courseId={props.course.id}
                                                    id={membership.id}
                                                    role={membership.kind}
                                                    disabled={
                                                        isOnlyOneLeadership &&
                                                        isLeadershipRole(
                                                            membership.kind
                                                        )
                                                    }
                                                    successFunc={
                                                        onRoleChangeSuccess
                                                    }
                                                    refetch={refetch}
                                                />
                                            )}
                                        </Table.Cell>
                                        {leader && (
                                            <Table.Cell textAlign="center">
                                                <RemoveButton
                                                    disabled={
                                                        isOnlyOneLeadership &&
                                                        isLeadershipRole(
                                                            membership.kind
                                                        )
                                                    }
                                                    courseId={props.course.id}
                                                    id={membership.id}
                                                    userName={`${membership.user.firstName} ${membership.user.lastName}`}
                                                    isInvited={false}
                                                    successFunc={
                                                        onRemoveSuccess
                                                    }
                                                />
                                            </Table.Cell>
                                        )}
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                        <div>
                            {`${filteredUsers.length} user${
                                filteredUsers.length === 1 ? "" : "s"
                            }`}
                        </div>
                    </Segment>
                )}
            </Grid.Row>
            <Snackbar
                open={toast.open}
                autoHideDuration={6000}
                onClose={closeToast}
            >
                <Alert
                    severity={toast.success ? "success" : "error"}
                    onClose={closeToast}
                >
                    <span>{toast.message}</span>
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Roster;
