import * as firebase from "firebase/app";
import "firebase/auth";

const config = {
    apiKey: "AIzaSyAiEIpy5y_EGS9lOeMc5NQF5VDUiJScSqE",
    authDomain: "office-hour-q.firebaseapp.com",
    databaseURL: "https://office-hour-q.firebaseio.com",
    projectId: "office-hour-q",
    storageBucket: "office-hour-q.appspot.com",
    messagingSenderId: "568677802289",
    appId: "1:568677802289:web:484c570bdf43e9f3895010",
    measurementId: "G-D15H76QXYB"
};

class Firebase {
    constructor() {
        firebase.initializeApp(config);

        this.auth = firebase.auth();
        this.googleProvider = new firebase.auth.GoogleAuthProvider();
    }

    doSignInWithGoogle = () =>
        this.auth.signInWithPopup(this.googleProvider);

    doSignOut = () => this.auth.signOut();

    onAuthUserListener = (next, fallback) =>
        this.auth.onAuthStateChanged(authUser => {
            if (authUser) {
                authUser = {
                    uid: authUser.uid,
                    name: authUser.displayName,
                    email: authUser.email,
                    providerData: authUser.providerData
                }

                next(authUser)
            }
            // if (authUser) {
            //     this.user(authUser.uid)
            //         .once('value')
            //         .then(snapshot => {
            //             const dbUser = snapshot.val();

            //             // default empty roles
            //             if (!dbUser.roles) {
            //                 dbUser.roles = {};
            //             }

            //             // merge auth and db user
            //             authUser = {
            //                 uid: authUser.uid,
            //                 email: authUser.email,
            //                 emailVerified: authUser.emailVerified,
            //                 providerData: authUser.providerData,
            //                 // ...dbUser,
            //             };

            //             next(authUser);
            //         });
            // } else {
            //     fallback();
            // }
    });
}

export default Firebase;