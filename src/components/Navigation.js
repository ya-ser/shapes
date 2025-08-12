import React from 'react';
import './Navigation.css';

const Navigation = () => {
  const navigationItems = [
    { label: 'About', href: '#about', section: 'about' },
    { label: 'Method', href: '#method', section: 'method' },
    { label: 'Workshops', href: '#workshops', section: 'workshops' },
    { label: 'Get Involved', href: '#involved', section: 'involved' },
    { label: 'Contact', href: '#contact', section: 'contact' }
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    
    const targetSection = document.querySelector(href);
    if (targetSection) {
      const headerHeight = document.querySelector('.header').offsetHeight;
      const targetPosition = targetSection.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="navigation">
      <ul className="nav-links">
        {navigationItems.map((item) => (
          <li key={item.section}>
            <a 
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="nav-link"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;