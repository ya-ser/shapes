import React, { useState, useEffect } from 'react';
import { statusBarContent } from '../data/fileContent';

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
      <span>{statusBarContent.terminal}</span>
      <span>{statusBarContent.project}</span>
      <span>
        {statusBarContent.user}
        <span className={`cursor ${showCursor ? '' : 'hidden'}`}>|</span>
      </span>
    </div>
  );
};

export default StatusBar;