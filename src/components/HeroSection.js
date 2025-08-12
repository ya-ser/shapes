import React from 'react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <div className="hero-text">
          <div className="tagline">A creative studio where people explore ideas through hands-on art</div>
          <h1>SHAPES is where concepts become creations</h1>
          <p className="hero-description">
            <strong>SHAPES is a creative studio where people explore ideas like "home," "identity," and "legacy" through hands-on art projects.</strong>
          </p>
          <p>Open to anyone—no art background required—we help people connect, share stories, and feel a deeper sense of belonging in their community.</p>
          
          <div className="baldwin-quote">
            "I remember standing on a street corner with the black painter Beauford Delaney down in the Village waiting for the light to change, and he pointed down and said, 'Look.' I looked and all I saw was the water. And he said, 'Look again,' which I did, and I saw oil on the water and the city reflected in the puddle. It was a great revelation to me. I can't explain it. He taught me how to see, and how to trust what I saw. Painters have often taught writers how to see. And once you've had that experience, you see differently."
            <div className="baldwin-attribution">— James Baldwin</div>
          </div>
          
          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-number">3</div>
              <div className="stat-label">Core Workshops</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">ALL</div>
              <div className="stat-label">Skill Levels</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">∞</div>
              <div className="stat-label">Possibilities</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;