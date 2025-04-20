import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDHZhCqyINXoRO3avIY7UBr5uvOUKLpW0Q",
  authDomain: "survey-application-fd2b3.firebaseapp.com",
  projectId: "survey-application-fd2b3",
  storageBucket: "survey-application-fd2b3.firebasestorage.app",
  messagingSenderId: "857467301051",
  appId: "1:857467301051:web:2f2fffa131e145736f8d9e",
  measurementId: "G-R6WKH3YF0B",
//   databaseURL:'https://survey-application-fd2b3-default-rtdb.firebaseio.com'
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const auth = getAuth(app); // Initialize Firebase Authentication
const analytics = getAnalytics(app);