import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TopIps = () => {
  const [topIps, setTopIps] = useState([]);

  useEffect(() => {
    const fetchTopIps = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/top-ips');
        if (response.data.status === 'success') {
          setTopIps(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch Top IPs:", error);
      }
    };

    fetchTopIps();
    const interval = setInterval(fetchTopIps, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Calculate the maximum attack count for scaling the progress bar width
  const maxCount = topIps.length > 0 ? topIps[0].attack_count : 0;

  return (
    <div className="space-y-4 overflow-y-auto h-full pr-2 custom-scrollbar">
      {topIps.map((item, index) => (
        <div key={index} className="group">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-300 font-mono">
              <span className="text-cyan-500 mr-2">#{index + 1}</span>
              {item.src_ip}
            </span>
            <span className="text-cyan-400 font-bold">{item.attack_count}</span>
          </div>

          {/* Dynamic progress bar */}
          <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000"
              style={{ width: `${(item.attack_count / maxCount) * 100}%` }}
            ></div>
          </div>

          <div className="text-[10px] text-slate-500 mt-0.5">Origin: {item.country}</div>
        </div>
      ))}
    </div>
  );
};

export default TopIps;
