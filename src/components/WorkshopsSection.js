import React from 'react';
import './WorkshopsSection.css';

const WorkshopItem = ({ title, subtitle, description }) => {
  return (
    <div className="workshop-item">
      <div className="workshop-title">{title}</div>
      {subtitle && <div className="workshop-subtitle">{subtitle}</div>}
      <div className="workshop-description">
        {Array.isArray(description) ? (
          description.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))
        ) : (
          <p>{description}</p>
        )}
      </div>
    </div>
  );
};

const WorkshopsSection = () => {
  const workshops = [
    {
      title: "SHAPES == home?",
      description: [
        "Participants design and build a birdhouse that reflects their own idea of \"home.\" Through our Prompt → Play → Reflect process, we explore what home truly means—is it a place, a feeling, a memory, or something else entirely?",
        "The result is both a personal artifact and a gift to nature, embodying how individual expression can contribute to collective well-being."
      ]
    },
    {
      title: "SHAPES == legacy?",
      subtitle: "Comic writing workshop for youth",
      description: [
        "Young creators explore their aspirations by giving visual form to their dreams. Through storytelling prompts and collaborative comic creation, participants discover how their individual dreams connect to larger community hopes."
      ]
    },
    {
      title: "SHAPES == discussion?",
      subtitle: "Gamified discussions for adults",
      description: [
        "Complex philosophical concepts become accessible through hands-on creation. We might explore \"What is justice?\" by building sculptural representations, or examine \"What makes life meaningful?\" through collaborative installations."
      ]
    }
  ];

  return (
    <section id="workshops" className="workshops-section">
      <div className="container">
        <div className="section-title">_003 // WORKSHOPS</div>
        
        {workshops.map((workshop, index) => (
          <WorkshopItem
            key={index}
            title={workshop.title}
            subtitle={workshop.subtitle}
            description={workshop.description}
          />
        ))}
      </div>
    </section>
  );
};

export default WorkshopsSection;