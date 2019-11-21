import app from 'firebase/app';

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
    app.initializeApp(config);
  }
}

export default Firebase;