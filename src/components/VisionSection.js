import React from 'react';
import './VisionSection.css';

const VisionCard = ({ title, description }) => {
  return (
    <div className="vision-card">
      <div className="vision-title">{title}</div>
      <div className="vision-description">{description}</div>
    </div>
  );
};

const VisionSection = () => {
  const visionItems = [
    {
      title: "Youth Programs",
      description: "Exploring identity through visual storytelling and collaborative creation that helps young people discover their voice."
    },
    {
      title: "Intergenerational Workshops", 
      description: "Where participants create legacy pieces together, bridging generational gaps through shared creative experiences."
    },
    {
      title: "Community Healing Initiatives",
      description: "Using art as a bridge for difficult conversations and community healing through collaborative meaning-making."
    },
    {
      title: "Cultural Celebration Events",
      description: "Where traditions take new artistic forms and communities celebrate their heritage through creative exploration."
    }
  ];

  return (
    <section id="vision" className="vision-section">
      <div className="container">
        <div className="section-title">_004 // VISION</div>
        
        <h2 className="vision-heading">
          SHAPES has significant potential to serve diverse communities through workshops that include:
        </h2>
        
        <div className="vision-grid">
          {visionItems.map((item, index) => (
            <VisionCard
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

export default VisionSection;