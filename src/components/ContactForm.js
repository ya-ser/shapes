import React, { useState } from 'react';
import './ContactForm.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interest: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.interest) {
      newErrors.interest = 'Please select your interest';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear submit status when user makes changes
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, we'll just log the form data and show success
      console.log('Form submitted:', formData);
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        interest: '',
        message: ''
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-form-container">
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`form-input ${errors.name ? 'error' : ''}`}
            placeholder="Your full name"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="your.email@example.com"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="interest" className="form-label">
            I'm interested in *
          </label>
          <select
            id="interest"
            name="interest"
            value={formData.interest}
            onChange={handleInputChange}
            className={`form-select ${errors.interest ? 'error' : ''}`}
          >
            <option value="">Select your interest</option>
            <option value="workshop">Joining a workshop</option>
            <option value="partnership">Partnership opportunities</option>
            <option value="newsletter">Newsletter subscription</option>
            <option value="other">Other</option>
          </select>
          {errors.interest && <span className="error-message">{errors.interest}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="message" className="form-label">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            className={`form-textarea ${errors.message ? 'error' : ''}`}
            placeholder="Tell us about your interest in SHAPES..."
            rows="5"
          />
          {errors.message && <span className="error-message">{errors.message}</span>}
        </div>

        <button
          type="submit"
          className={`form-submit ${isSubmitting ? 'loading' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>

        {submitStatus === 'success' && (
          <div className="status-message success">
            Thank you for your message! We'll get back to you soon.
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="status-message error">
            Sorry, there was an error sending your message. Please try again.
          </div>
        )}
      </form>
    </div>
  );
};

export default ContactForm;