import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

// Use lightweight open‑source world map topology data
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const ThreatMap = () => {
  const [attacks, setAttacks] = useState([]);

  useEffect(() => {
    // Fetch data from the Flask API we created earlier
    // IMPORTANT: Replace with your VM's real IP so the Windows host can access it
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/map-data');
        if (response.data.status === 'success') {
          setAttacks(response.data.data);
        }
      } catch (error) {
        console.error("API request failed — check whether Flask is running:", error);
      }
    };

    fetchData();
    // Refresh every 5 seconds to simulate “real‑time” updates
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-grow relative">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 120 }}
          className="w-full h-full object-cover"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1E293B" // Dark blue land color
                  stroke="#334155" // Border line color
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#334155", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Loop through attack data and draw red markers on the map */}
          {attacks.map((attack, index) => (
            <Marker key={index} coordinates={[attack.longitude, attack.latitude]}>
              <circle r={6} fill="#EF4444" opacity={0.8} />
              <circle r={12} fill="#EF4444" opacity={0.3} className="animate-ping" />
              <text
                textAnchor="middle"
                y={-15}
                style={{ fill: "#94A3B8", fontSize: "10px", fontWeight: "bold" }}
              >
                {attack.city}
              </text>
            </Marker>
          ))}
        </ComposableMap>
      </div>
    </div>
  );
};

export default ThreatMap;
