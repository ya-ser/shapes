import React from 'react';
import './GetInvolvedSection.css';

const InvolvedCard = ({ title, description, buttonText, onClick }) => {
  return (
    <div className="involved-card">
      <div className="involved-title">{title}</div>
      <div className="involved-description">{description}</div>
      <button className="involved-button" onClick={onClick}>
        {buttonText}
      </button>
    </div>
  );
};

const GetInvolvedSection = () => {
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const involvedItems = [
    {
      title: "Join a Workshop",
      description: "Check our calendar for upcoming sessions. Each workshop is limited to ensure intimate, meaningful experiences.",
      buttonText: "View Calendar"
    },
    {
      title: "Partner with Us", 
      description: "Are you part of a school, community center, or organization interested in bringing SHAPES to your community? We'd love to collaborate.",
      buttonText: "Start Partnership"
    },
    {
      title: "Stay Connected",
      description: "Sign up for our newsletter to hear about new workshops, community stories, and the beautiful shapes people are creating.",
      buttonText: "Subscribe"
    }
  ];

  return (
    <section id="involved" className="involved-section">
      <div className="container">
        <div className="section-title">_006 // GET_INVOLVED</div>
        
        <div className="involved-grid">
          {involvedItems.map((item, index) => (
            <InvolvedCard
              key={index}
              title={item.title}
              description={item.description}
              buttonText={item.buttonText}
              onClick={scrollToContact}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GetInvolvedSection;