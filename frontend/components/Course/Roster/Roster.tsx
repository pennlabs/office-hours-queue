import React, { useState, useEffect, useContext } from "react";
import { Segment, Header, Grid, Table } from "semantic-ui-react";
import _ from "lodash";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import RosterForm from "./RosterForm";
import RemoveButton from "./RemoveButton";
import InviteModal from "./Invites/InviteModal";

import { prettifyRole, isLeadershipRole } from "../../../utils/enums";
import ChangeRoleDropdown from "./ChangeRoleDropdown";
import { AuthUserContext } from "../../../utils/auth";
import { Kind, Membership, MembershipInvite, Course } from "../../../types";
import {
    useInvitedMembers,
    useMembers,
    useStaff,
} from "../../../hooks/data-fetching/course";

interface RosterProps {
    course: Course;
    memberships: Membership[];
    invites: MembershipInvite[];
}
const Roster = (props: RosterProps) => {
    const { course, memberships: rawMemberships, invites } = props;
    const courseId = course.id;
    // Types
    type tableStateType = {
        direction: "ascending" | "descending";
        column: string;
    };

    const { data: membershipsData, mutate: membershipsMutate } = useMembers(
        courseId,
        rawMemberships
    );

    // membershipsData is non null because initialData is provided
    // and the key stays the same
    const memberships = membershipsData!;

    const { user: initialUser } = useContext(AuthUserContext);
    if (!initialUser) {
        throw new Error(
            "Invariant broken: withAuth must be used with component"
        );
    }

    const { leader } = useStaff(courseId, initialUser);

    /* STATE */
    const [filteredUsers, setFilteredUsers] = useState(memberships);
    const {
        data: invitedMembersData,
        mutate: invitedMutate,
    } = useInvitedMembers(courseId, invites);

    // invitedMembersData is non null because initialData is provided
    // and the key stays the same
    const invitedMembers = invitedMembersData!;

    const [open, setOpen] = useState(false);
    const [invitedTableState, setInvitedTableState]: [
        tableStateType,
        React.Dispatch<React.SetStateAction<tableStateType>>
    ] = useState({
        direction: "ascending",
        column: "email",
    });
    const [tableState, setTableState]: [
        tableStateType,
        React.Dispatch<React.SetStateAction<tableStateType>>
    ] = useState({
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
        await membershipsMutate(-1, {});
        triggerModal();
    };

    /* LOAD DATA */

    const isOnlyOneLeadership =
        memberships.filter((membership) => isLeadershipRole(membership.kind))
            .length < 2;

    // TODO: this isn't a great way of doing this. filtered users should be useMemo()
    const memString = JSON.stringify(memberships);
    useEffect(() => {
        setFilteredUsers(memberships);
    }, [memString, memberships]);

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
            message: "Invitation successfully revoked",
        });
    };

    const setInviteResendToast = () => {
        setToast({
            open: true,
            success: true,
            message: "Invitation successfully resent",
        });
    };

    const setChangeRoleToast = () => {
        setToast({
            open: true,
            success: true,
            message: "Role successfully updated",
        });
    };

    const closeToast = () => {
        setToast({
            open: false,
            success: true,
            message: "",
        });
    };

    const onInviteSuccess = async () => {
        setRosterUpdateToast();
        await invitedMutate(-1, {}, { method: "GET" }); // Re-validate.
    };

    const onRemoveSuccess = async (name) => {
        setUserRemovedToast(name);
    };

    const onRevokeSuccess = async () => {
        setInviteRevokedToast();
    };

    const onRoleChangeSuccess = async () => {
        setChangeRoleToast();
    };

    const getInviteFilter = (column: string): string[] => {
        if (column === "role") {
            return ["kind"];
        } else {
            return ["email"];
        }
    };

    const getFilter = (column: string): string[] => {
        if (column === "role") {
            return ["kind"];
        } else if (column === "fullName") {
            return ["user.firstName", "user.lastName"];
        } else {
            return ["user.email"];
        }
    };
    return (
        <div>
            {memberships && (
                <InviteModal
                    open={open}
                    closeFunc={closeModal}
                    courseId={courseId}
                    successFunc={onInviteSuccess}
                    setToast={setToast}
                />
            )}
            <Grid.Row>
                {memberships && (
                    <Segment basic>
                        <RosterForm
                            showShowInvitedButton={
                                invitedMembers.length > 0 && !course.archived
                            }
                            showInviteButton={leader && !course.archived}
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
                                                : undefined
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
                                                : undefined
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
                                    getInviteFilter(invitedTableState.column),
                                    [
                                        invitedTableState.direction ===
                                        "ascending"
                                            ? "asc"
                                            : "desc",
                                    ]
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
                                                    mutateInvites={
                                                        invitedMutate
                                                    }
                                                    mutateMemberships={
                                                        membershipsMutate
                                                    }
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
                                                : undefined
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
                                                : undefined
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
                                                : undefined
                                        }
                                        onClick={() => handleSort("role")}
                                        width={2}
                                    >
                                        Role
                                    </Table.HeaderCell>
                                    {leader && !course.archived && (
                                        <Table.HeaderCell width={1}>
                                            Remove
                                        </Table.HeaderCell>
                                    )}
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {_.orderBy(
                                    filteredUsers,
                                    getFilter(tableState.column),
                                    [
                                        tableState.direction === "ascending"
                                            ? "asc"
                                            : "desc",
                                    ]
                                ).map((membership: Membership) => (
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
                                            course.archived ||
                                            membership.kind === Kind.STUDENT ? (
                                                prettifyRole(membership.kind)
                                            ) : (
                                                <ChangeRoleDropdown
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
                                                    mutate={membershipsMutate}
                                                />
                                            )}
                                        </Table.Cell>
                                        {leader && !course.archived && (
                                            <Table.Cell textAlign="center">
                                                <RemoveButton
                                                    mutateInvites={
                                                        invitedMutate
                                                    }
                                                    mutateMemberships={
                                                        membershipsMutate
                                                    }
                                                    disabled={
                                                        isOnlyOneLeadership &&
                                                        isLeadershipRole(
                                                            membership.kind
                                                        )
                                                    }
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
