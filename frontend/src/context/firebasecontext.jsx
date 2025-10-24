import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { createContext, useContext } from "react";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();
const FirebaseContext = createContext(null);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};

export const FirebaseProvider = ({ children }) => {
  const registerUser = async (email, password) => {
    try {
      const userCredentials = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredentials.user;
      console.log("User registered:", { uid: user.uid, email: user.email });
      await sendEmailVerification(user);
      return { success: true, message: "Verification email sent. Please verify your email." };
    } catch (error) {
      console.error("Signup error:", error.code, error.message);
      throw new Error(error.message);
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;
      if (!user.emailVerified) {
        throw new Error("Please verify your email before logging in.");
      }
      return { success: true, message: "Login successful!" };
    } catch (error) {
      console.error("Login error:", error.code, error.message);
      throw new Error(error.message);
    }
  };

  const googleSignIn = async () => {
    try {
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;
      console.log("Google user:", { uid: user.uid, email: user.email });
      return { success: true, message: "Google login successful!" };
    } catch (error) {
      console.error("Google Sign-In error:", error.code, error.message);
      throw new Error(error.message);
    }
  };

  return (
    <FirebaseContext.Provider value={{ registerUser, login, googleSignIn, firebaseApp }}>
      {children}
    </FirebaseContext.Provider>
  );
};