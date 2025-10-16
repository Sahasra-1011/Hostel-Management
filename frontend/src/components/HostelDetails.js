// src/components/HostelDetails.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default marker icon (bundlers often break the default)
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function HostelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState(null);

  useEffect(() => {
    const fetchHostel = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/gethostel/${id}`);
        console.log("DEBUG: hostel fetched", res.data);
        setHostel(res.data);
      } catch (err) {
        console.error("Error fetching hostel details:", err);
        alert("Unable to fetch hostel details.");
      }
    };
    fetchHostel();
  }, [id]);

  if (!hostel) return <p style={{textAlign:"center",marginTop:40}}>Loading hostel details...</p>;

  // Defensive coords check
  const lat = Number(hostel.lat);
  const lon = Number(hostel.lon);
  if (!lat || !lon) return <p style={{textAlign:"center",marginTop:40}}>Invalid coordinates for this hostel.</p>;

  return (
    <div className="details-page" style={{padding:30, minHeight:"100vh", textAlign:"center"}}>
      <button onClick={() => navigate("/")} className="back-btn" style={{marginBottom:20}}>← Back</button>

      <h2>🏠 {hostel.tags?.name || "Unnamed Hostel"}</h2>
      <p><strong>Latitude:</strong> {lat}</p>
      <p><strong>Longitude:</strong> {lon}</p>
      <p><strong>Tourism Type:</strong> {hostel.tags?.tourism}</p>
      <p><strong>Hostel ID:</strong> {hostel.id}</p>

      <div id="map-container" style={{width:"100%", display:"flex", justifyContent:"center"}}>
        {/* key forces a full re-render of the map when coords change */}
        <MapContainer
          key={`${lat}-${lon}`}
          center={[lat, lon]}
          zoom={15}
          scrollWheelZoom={false}
          className="leaflet-map"
          style={{height: "400px", width: "80%", maxWidth: 900, borderRadius: 10}}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lon]}>
            <Popup>{hostel.tags?.name || "Hostel Location"}</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}

export default HostelDetails;
