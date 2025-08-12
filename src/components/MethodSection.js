import React from 'react';
import './MethodSection.css';

const MethodCard = ({ title, description, showArrow }) => {
  return (
    <div className="method-card">
      <div className="method-title">{title}</div>
      <div className="method-description">{description}</div>
      {showArrow && <div className="method-arrow">→</div>}
    </div>
  );
};

const MethodSection = () => {
  const methodSteps = [
    {
      title: "Prompt",
      description: "We begin by asking questions that inspire imagination and storytelling. These aren't just warm-up activities—they're carefully designed inquiries that help you tap into your personal experiences and perspectives on the session's central theme.",
      showArrow: true
    },
    {
      title: "Play", 
      description: "Then we create. Based on the insights from our prompting phase, we dive into hands-on art-making. This is where ideas become tangible, where abstract thoughts take physical form, and where the magic of creation happens.",
      showArrow: true
    },
    {
      title: "Reflect",
      description: "Finally, we come together to reflect on both the creative process and the final shape of our art pieces. This isn't critique—it's celebration and deeper understanding of what we've created and what it means to us.",
      showArrow: false
    }
  ];

  return (
    <section id="method" className="method-section">
      <div className="container">
        <div className="section-title">_002 // METHOD</div>
        
        <h2 className="method-heading">Prompt → Play → Reflect</h2>
        
        <p className="method-intro">
          Every SHAPES workshop follows our signature three-part methodology, inspired by the power of structured creative exploration.
        </p>
        
        <div className="method-grid">
          {methodSteps.map((step, index) => (
            <MethodCard
              key={index}
              title={step.title}
              description={step.description}
              showArrow={step.showArrow}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MethodSection;