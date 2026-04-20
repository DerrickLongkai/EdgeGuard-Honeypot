import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PasswordCloud = () => {
  const [words, setWords] = useState([]);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/passwords');
        if (response.data.status === 'success') {
          setWords(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch passwords:", error);
      }
    };

    fetchWords();
    const interval = setInterval(fetchWords, 10000);
    return () => clearInterval(interval);
  }, []);

  if (words.length === 0) return <div className="text-slate-500 text-sm mt-4">Waiting for intelligence data...</div>;

  // Calculate the maximum and minimum attack counts to scale font sizes proportionally
  const maxCount = Math.max(...words.map(w => w.count));
  const minCount = Math.min(...words.map(w => w.count));

  // Dynamically calculate font size (between 12px and 36px)
  const getFontSize = (count) => {
    if (maxCount === minCount) return '16px';
    const size = 12 + ((count - minCount) / (maxCount - minCount)) * 24;
    return `${size}px`;
  };

  // Dynamically calculate colors (high frequency: red, medium: orange, low: cyan)
  const getColor = (count) => {
    const ratio = count / maxCount;
    if (ratio > 0.8) return 'text-red-400 text-shadow-glow-red';
    if (ratio > 0.4) return 'text-orange-400';
    if (ratio > 0.1) return 'text-cyan-300';
    return 'text-slate-500';
  };

  return (
    <div className="flex flex-wrap gap-4 items-center justify-center p-2 h-full overflow-y-auto custom-scrollbar content-start pt-4">
      {words.map((item, index) => (
        <span
          key={index}
          className={`transition-all duration-500 hover:scale-125 cursor-default select-none ${getColor(item.count)}`}
          style={{ 
            fontSize: getFontSize(item.count), 
            fontWeight: item.count > maxCount * 0.5 ? 'bold' : 'normal',
            opacity: 0.8 + (item.count / maxCount) * 0.2
          }}
          title={`Tried ${item.count} times`}
        >
          {item.password}
        </span>
      ))}
    </div>
  );
};

export default PasswordCloud;