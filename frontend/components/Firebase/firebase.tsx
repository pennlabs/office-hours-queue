// import * as firebase from "firebase/app";
// import "firebase/auth";
// import "firebase/analytics";
//
// const project = process.env.REACT_APP_GCLOUD_PROJECT;
//
// const PROD_CONFIG = {
//   apiKey: "AIzaSyAiEIpy5y_EGS9lOeMc5NQF5VDUiJScSqE",
//   authDomain: "ohq.io",
//   databaseURL: "https://office-hour-q.firebaseio.com",
//   projectId: "office-hour-q",
//   storageBucket: "office-hour-q.appspot.com",
//   messagingSenderId: "568677802289",
//   appId: "1:568677802289:web:484c570bdf43e9f3895010",
//   measurementId: "G-D15H76QXYB"
// };
//
// const STG_CONFIG = {
//   apiKey: "AIzaSyCFww1i9Gs0XB843mMuJf28H7kfNp43msk",
//   authDomain: "stg.ohq.io",
//   databaseURL: "https://office-hour-q-stg.firebaseio.com",
//   projectId: "office-hour-q-stg",
//   storageBucket: "office-hour-q-stg.appspot.com",
//   messagingSenderId: "904650088599",
//   appId: "1:904650088599:web:504e9023755dd2a5c989d2",
//   measurementId: "G-N83MXH3L7H"
// };
//
// const config =
//   project === 'office-hour-q' ? PROD_CONFIG :
//   project === 'office-hour-q-stg' ? STG_CONFIG : undefined;
//
// class Firebase {
//   constructor() {
//     firebase.initializeApp(config);
//
//     this.firebase = firebase;
//     this.auth = firebase.auth();
//     this.analytics = firebase.analytics();
//     this.googleProvider = new firebase.auth.GoogleAuthProvider();
//     this.googleProvider.setCustomParameters({
//       prompt: 'select_account'
//     });
//   }
//
//   doSignInWithGoogle = () =>
//     this.auth.signInWithPopup(this.googleProvider);
//
//   doSignOut = () => this.auth.signOut();
// }
//
// export default new Firebase();
