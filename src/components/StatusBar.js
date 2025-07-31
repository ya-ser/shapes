import React, { useState, useEffect } from 'react';

const StatusBar = () => {
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 750);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="status-bar">
      <span>TERMINAL: ACTIVE</span>
      <span>SHAPES == _EXPERIMENTAL_COMMUNITY_PROTOCOLS</span>
      <span>
        USER: VISITOR
        <span className={`cursor ${showCursor ? '' : 'hidden'}`}>|</span>
      </span>
    </div>
  );
};

export default StatusBar;