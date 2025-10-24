import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../context/firebasecontext.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FcGoogle } from "react-icons/fc";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const navigate = useNavigate();
  const firebase = useFirebase();

  const signInUser = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setShowResend(false); // Reset resend link

    try {
      const result = await firebase.login(email, password);
      toast.success(result.message);
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      const message = error.message;

      if (message.includes("verify your email")) {
        toast.warn(message);
        setShowResend(true);
      } else if (message.includes("Incorrect password")) {
        toast.error("Incorrect password.");
      } else if (message.includes("No account found")) {
        toast.error("No account with this email.");
      } else if (message.includes("Invalid email")) {
        toast.error("Please enter a valid email.");
      } else {
        toast.error(message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await firebase.googleSignIn();
      toast.success(result.message);
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      toast.error(error.message || "Google login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!email) {
      toast.error("Please enter your email first.");
      return;
    }

    try {
      // Re-attempt login to get user object, then resend
      const userCredential = await firebase.firebaseApp.auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await user.sendEmailVerification();
        await firebase.firebaseApp.auth().signOut();
        toast.success("Verification email sent again!");
      }
    } catch (error) {
      if (error.message.includes("verify your email")) {
        toast.info("Check your inbox (and spam) for the original email.");
      } else {
        toast.error("Failed to resend. Try again.");
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Sign In</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          signInUser();
        }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          disabled={isLoading}
        />
        <button type="submit" style={styles.button} disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {showResend && (
        <p style={{ ...styles.resendText, marginTop: "12px" }}>
          Didn't get the email?{" "}
          <span style={styles.resendLink} onClick={resendVerificationEmail}>
            Resend verification email
          </span>
        </p>
      )}

      <p style={styles.or}>or</p>

      <button
        onClick={handleGoogleSignIn}
        style={styles.googleBtn}
        disabled={isLoading}
      >
        <FcGoogle size={20} style={{ marginRight: "8px" }} />
        Continue with Google
      </button>

      <p style={styles.linkText}>
        Don’t have an account?{" "}
        <span style={styles.link} onClick={() => navigate("/register")}>
          Register here
        </span>
      </p>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "30px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  heading: { marginBottom: "20px", color: "#333" },
  input: {
    width: "90%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    width: "95%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "10px",
  },
  or: {
    margin: "15px 0",
    color: "#666",
    fontSize: "14px",
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "95%",
    padding: "12px",
    backgroundColor: "#fff",
    color: "#333",
    border: "1px solid #ccc",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  linkText: {
    marginTop: "20px",
    color: "#333",
    fontSize: "14px",
  },
  link: {
    color: "#007bff",
    textDecoration: "underline",
    cursor: "pointer",
  },
  resendText: {
    fontSize: "14px",
    color: "#555",
  },
  resendLink: {
    color: "#007bff",
    textDecoration: "underline",
    cursor: "pointer",
    fontWeight: "500",
  },
};

export default SignIn;