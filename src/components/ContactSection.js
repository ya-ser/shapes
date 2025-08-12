import React from 'react';
import ContactForm from './ContactForm';
import './ContactSection.css';

const ContactSection = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="section-title">_007 // CONTACT</div>
        <div className="contact-content">
          <h2>Get In Touch</h2>
          <p>Ready to explore ideas through hands-on art? Contact us today.</p>
          <ContactForm />
        </div>
      </div>
    </section>
  );
};

export default ContactSection;