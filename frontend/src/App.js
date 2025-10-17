import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import SignUp from "./components/SignUp";
import HostelDetails from "./components/HostelDetails";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [radius, setRadius] = useState("");
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);

  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!city || !radius) {
      alert("Please enter both city and radius!");
      return;
    }

    setLoading(true);
    setHostels([]);

    try {
      const res = await axios.get(`http://localhost:4000/gethostels/${city}/${radius}`);
      setHostels(res.data);
    } catch (error) {
      console.error("Error fetching hostels:", error);
      alert("Failed to fetch hostel data. Please check backend connection.");
    }

    setLoading(false);
  };

  const handleViewDetails = (id) => {
    navigate(`/details/${id}`);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          !isSignedUp ? (
            <SignUp onSignUp={() => setIsSignedUp(true)} />
          ) : (
            <div className="app-container">
              <div className="search-box">
                <h1 className="title">Hostel Finder</h1>
                <p className="subtitle">Find nearby hostels by city and radius</p>

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
                  />
                  <button onClick={handleSearch}>Search</button>
                </div>
              </div>

              <div className="results-container">
                {loading && <p className="loading">Loading hostels...</p>}

                {!loading && hostels.length > 0 && (
                  <div className="hostel-list">
                    {hostels.map((hostel, index) => (
                      <div className="hostel-card" key={index}>
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
          )
        }
      />
      <Route path="/details/:id" element={<HostelDetails />} />
    </Routes>
  );
}

export default App;