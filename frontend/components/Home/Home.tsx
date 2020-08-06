import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { Grid } from "semantic-ui-react";
import Dashboard from "./Dashboard/Dashboard";
import AccountSettings from "./AccountSettings/AccountSettings";
import HomeSidebar from "./HomeSidebar";

import { courseSortFunc } from "../../utils";

/* GRAPHQL QUERIES/MUTATIONS */
// const CURRENT_USER = gql`
//     {
//         currentUser {
//             id
//             fullName
//             preferredName
//             email
//             smsNotificationsEnabled
//             phoneNumber
//             smsVerified
//             courseUsers {
//                 edges {
//                     node {
//                         id
//                         course {
//                             id
//                             prettyId
//                             department
//                             courseCode
//                             courseTitle
//                             semester
//                             year
//                             archived
//                         }
//                         kind
//                     }
//                 }
//             }
//         }
//     }
// `;
//
const refetch = () => {};

const Home = ({}) => {
    /* GRAPHQL QUERIES/MUTATIONS */
    // const { data, refetch } = useQuery(CURRENT_USER);
    //

    /* STATE */
    const [active, setActive] = useState("dashboard");
    const [courses, setCourses] = useState([]);
    const [user, setUser] = useState({});
    const [newUser, setNewUser] = useState(false);

    /* LOAD DATA FUNCTIONS */
    // const loadCourses = (data) => {
    //     if (!data) return;
    //     document.title = "OHQ";
    //     return data.currentUser.courseUsers.edges
    //         .map((courseUser) => {
    //             return {
    //                 courseUserId: courseUser.node.id,
    //                 id: courseUser.node.course.id,
    //                 prettyId: courseUser.node.course.prettyId,
    //                 department: courseUser.node.course.department,
    //                 courseCode: courseUser.node.course.courseCode,
    //                 courseTitle: courseUser.node.course.courseTitle,
    //                 // description: courseUser.node.course.description,
    //                 semester: courseUser.node.course.semester,
    //                 year: courseUser.node.course.year,
    //                 archived: courseUser.node.course.archived,
    //                 kind: courseUser.node.kind,
    //             };
    //         })
    //         .sort(courseSortFunc);
    // };
    //
    // const loadUser = (data) => {
    //     if (!data) return;
    //     return {
    //         id: data.currentUser.id,
    //         email: data.currentUser.email,
    //         fullName: data.currentUser.fullName,
    //         preferredName: data.currentUser.preferredName,
    //         smsNotificationsEnabled: data.currentUser.smsNotificationsEnabled,
    //         phoneNumber: data.currentUser.phoneNumber,
    //         smsVerified: data.currentUser.smsVerified,
    //     };
    // };
    //
    /* UPDATE STATE ON QUERY */
    // if (data && data.currentUser) {
    //     const newCourses = loadCourses(data);
    //     const newUser = loadUser(data);
    //
    //     if (JSON.stringify(newCourses) !== JSON.stringify(courses)) {
    //         setCourses(newCourses);
    //     }
    //
    //     if (JSON.stringify(newUser) !== JSON.stringify(user)) {
    //         setUser(newUser);
    //     }
    // }
    //
    useEffect(() => {
        // async function fetchData() {
        //     await refetch();
        //     setCourses(loadCourses(data));
        //     setUser(loadUser(data));
        // }
        // try {
        //     fetchData();
        // } catch (e) {
        //     console.log(e);
        // }
    }, []);

    return (
        <Grid
            columns={2}
            divided="horizontally"
            style={{ width: "100%" }}
            stackable
        >
            <HomeSidebar active={active} clickFunc={setActive} />
            {user && courses && active === "dashboard" ? (
                <Dashboard
                    user={user}
                    courses={courses}
                    newUser={newUser}
                    setNewUser={setNewUser}
                    refetch={refetch}
                />
            ) : user && active === "account_settings" ? (
                <AccountSettings />
            ) : (
                <Dashboard
                    loading={true}
                    courses={[]}
                    newUser={newUser}
                    refetch={refetch}
                />
            )}
        </Grid>
    );
};

export default Home;
