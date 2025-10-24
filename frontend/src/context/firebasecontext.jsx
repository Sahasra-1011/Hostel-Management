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
      await sendEmailVerification(user);
      await firebaseAuth.signOut();
      console.log("User registered and signed out until verification:", { uid: user.uid, email: user.email });
      return { 
        success: true, 
        message: "Verification email sent. Please verify your email before logging in." 
      };
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
        await firebaseAuth.signOut(); // Immediate sign out
        throw new Error("Please verify your email before logging in.");
      }

      return { success: true, message: "Login successful!" };
    } catch (error) {
      console.error("Login error:", error.code, error.message);
      // Re-throw with user-friendly message
      if (error.code === 'auth/wrong-password') {
        throw new Error("Incorrect password.");
      } else if (error.code === 'auth/user-not-found') {
        throw new Error("No account found with this email.");
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("Invalid email address.");
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error("Too many attempts. Try again later.");
      }
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