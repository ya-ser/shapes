import React from 'react';
import './AboutSection.css';

const AboutSection = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="section-title">_001 // ABOUT</div>
        
        <div className="about-grid">
          <div className="about-text">
            <h2>At SHAPES, we believe that the most profound ideas deserve tangible form.</h2>
            <p>Our studio provides a welcoming space where abstract concepts like home, identity, and legacy transform into meaningful art pieces through collaborative exploration.</p>
            <p>We're not just making art—we're making meaning. Every session is designed to help participants discover new perspectives about themselves and their world, while creating something beautiful they can take home.</p>
          </div>
          
          <div className="about-right">
            <div className="about-highlight">
              <p><strong>No experience necessary.</strong> Just bring your curiosity and openness to explore.</p>
            </div>
            
            <p>Every SHAPES workshop creates space for authentic sharing and genuine discovery. When we make art together, we make meaning together.</p>
            <p>There's something powerful about holding a physical representation of an abstract concept. It makes the invisible visible, the intangible tangible.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;