import * as firebase from "firebase/app";
import "firebase/auth";

const config = {
  apiKey: "AIzaSyAiEIpy5y_EGS9lOeMc5NQF5VDUiJScSqE",
  authDomain: "ohq.io",
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
    this.googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  }

  doSignInWithGoogle = () =>
    this.auth.signInWithPopup(this.googleProvider);

  doSignOut = () => this.auth.signOut();

  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(async authUser => {
      if (authUser) {
        const result = await authUser.getIdTokenResult();
        authUser = {
          uid: authUser.uid,
          name: authUser.displayName,
          email: authUser.email,
          providerData: authUser.providerData,
          hasUserObject: result.claims.hasUserObject,
        };

        next(authUser)
      }
    });
}

export default new Firebase();
