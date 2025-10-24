// frontend/src/App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useFirebase } from "./context/firebasecontext.jsx";
import HostelDetails from "./components/HostelDetails";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [radius, setRadius] = useState("");
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false); // ✅ prevents premature unmounts
  const navigate = useNavigate();
  const firebase = useFirebase();

  useEffect(() => {
    if (!firebase.firebaseApp) {
      setError("Firebase initialization failed. Please try again later.");
      return;
    }

    const auth = getAuth(firebase.firebaseApp);
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setAuthChecked(true); // ✅ mark when Firebase finishes checking
        const publicRoutes = ["/login", "/register"];

        // Redirect unauthenticated users away from private routes
        if (!currentUser && !publicRoutes.includes(window.location.pathname)) {
          navigate("/login");
        }
      },
      (error) => {
        console.error("Auth state error:", error);
        setError("Authentication error. Please try again.");
        setAuthChecked(true);
      }
    );

    return () => unsubscribe();
  }, [navigate, firebase.firebaseApp]);

  const handleSearch = async () => {
    if (!city.trim()) {
      setError("Please enter a valid city name.");
      return;
    }
    if (!radius || parseInt(radius) <= 0) {
      setError("Please enter a valid radius (positive number).");
      return;
    }

    setLoading(true);
    setError("");
    setHostels([]);

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/gethostels/${encodeURIComponent(city)}/${radius}`
      );
      setHostels(res.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to fetch hostel data. Please check your connection or try again."
      );
    }

    setLoading(false);
  };

  const handleViewDetails = (id) => {
    navigate(`/details/${id}`);
  };

  const handleLogout = async () => {
    try {
      await getAuth(firebase.firebaseApp).signOut();
      navigate("/login");
    } catch (error) {
      setError("Failed to log out. Please try again.");
    }
  };

  const ProtectedRoute = ({ children }) => {
    if (!firebase.firebaseApp) return <p>Firebase not initialized. Please refresh.</p>;
    if (!authChecked) return <p>Checking authentication...</p>; // ✅ avoids unmounting during auth check
    return user ? children : null;
  };

  return (
    <Routes>
      <Route path="/register" element={<SignUp />} />
      <Route path="/login" element={<SignIn />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div className="app-container">
              <div className="search-box">
                <h1 className="title">Hostel Finder</h1>
                <p className="subtitle">Find nearby hostels by city and radius</p>

                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                >
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Enter city name"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Radius (meters)"
                      value={radius}
                      onChange={(e) => setRadius(e.target.value)}
                      min="1"
                    />
                    <button type="submit" disabled={loading}>
                      {loading ? "Searching..." : "Search"}
                    </button>
                  </div>
                </form>

                {error && <p className="error-message">{error}</p>}
              </div>

              <div className="results-container">
                {loading && <p className="loading">Loading hostels...</p>}
                {!loading && hostels.length > 0 && (
                  <div className="hostel-list">
                    {hostels.map((hostel) => (
                      <div className="hostel-card" key={hostel.id}>
                        <h3>{hostel.tags?.name || "Unnamed Hostel"}</h3>
                        <p>
                          🌍 Latitude: {hostel.lat} <br />
                          📍 Longitude: {hostel.lon}
                        </p>
                        <button
                          onClick={() => handleViewDetails(hostel.id)}
                          className="details-btn"
                        >
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {!loading && hostels.length === 0 && (
                  <p className="no-results">No hostels found yet. Try searching.</p>
                )}
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/details/:id"
        element={
          <ProtectedRoute>
            <HostelDetails />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;