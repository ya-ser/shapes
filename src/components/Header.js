import React from 'react';
import Navigation from './Navigation';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">SHAPES</div>
        <Navigation />
      </div>
    </header>
  );
};

export default Header;