import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../context/firebasecontext.jsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FcGoogle } from "react-icons/fc";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const firebase = useFirebase();

  useEffect(() => {
    const auth = getAuth(firebase.firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/");
    });
    return () => unsubscribe();
  }, [firebase.firebaseApp, navigate]);

  const signInUser = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await firebase.login(email, password);
      toast.success(result.message);
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      toast.error(error.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await firebase.googleSignIn();
      toast.success(result.message);
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      toast.error(error.message || "Google login failed.");
    } finally {
      setIsLoading(false);
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

      <p style={styles.or}>or</p>

      <button onClick={handleGoogleSignIn} style={styles.googleBtn} disabled={isLoading}>
        <FcGoogle size={20} style={{ marginRight: "8px" }} />
        Continue with Google
      </button>

      <p style={styles.linkText}>
        Don’t have an account?{" "}
        <span style={styles.link} onClick={() => navigate("/register")}>
          Register here
        </span>
      </p>

      <ToastContainer />
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
  },
  or: {
    marginTop: "10px",
    marginBottom: "10px",
    color: "#666",
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
    marginTop: "15px",
    color: "#333",
  },
  link: {
    color: "#007bff",
    textDecoration: "underline",
    cursor: "pointer",
  },
};

export default SignIn;