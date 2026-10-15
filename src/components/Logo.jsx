import React from 'react';
import logo from '../assets/logo.png'; // Import your image
// import logo from '../assets/logo.svg'; // For SVG
import './Logo.css';

const Logo = () => {
  return (
    <div className="logo-container">
      <div className="logo-wrapper">
    
        
        {/* Your Logo Image */}
        <div className="logo-content">
          <img 
            src={logo} 
            alt="Company Logo" 
            className="logo-image"
          />
          <div className="logo-text">
            <span className="brand-name">உ உ</span>
            <span className="tagline">உன்னைத் தேடி உடனே வரும்.</span>
          </div>
        </div>
        
      
      </div>
    </div>
  );
};

export default Logo;