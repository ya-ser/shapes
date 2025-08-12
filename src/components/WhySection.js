import React from 'react';
import './WhySection.css';

const WhyItem = ({ title, description }) => {
  return (
    <div className="why-item">
      <div className="why-title">{title}</div>
      <div className="why-description">{description}</div>
    </div>
  );
};

const WhySection = () => {
  const whyItems = [
    {
      title: "It's about connection, not perfection",
      description: "Our workshops create space for authentic sharing and genuine discovery. When we make art together, we make meaning together."
    },
    {
      title: "Everyone has something to contribute",
      description: "We've seen quiet participants find their voice through clay, and experienced artists discover new perspectives through collaborative creation."
    },
    {
      title: "Ideas become tangible",
      description: "There's something powerful about holding a physical representation of an abstract concept. It makes the invisible visible, the intangible tangible."
    },
    {
      title: "Community grows through creation",
      description: "Shared creative experiences build lasting connections between people who might never have met otherwise."
    }
  ];

  return (
    <section id="why" className="why-section">
      <div className="container">
        <div className="section-title">_005 // WHY</div>
        
        <div className="why-grid">
          {whyItems.map((item, index) => (
            <WhyItem
              key={index}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhySection;