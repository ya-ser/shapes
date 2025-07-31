import React, { useEffect } from 'react';

const Modal = ({ isOpen, content, onClose }) => {
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal" style={{ display: 'flex' }} onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose} aria-label="Close"></button>
        <div id="modalContent" style={{ marginTop: '20px' }}>
          <pre>{content}</pre>
        </div>
      </div>
    </div>
  );
};

export default Modal;