import React from 'react';

export const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <div className="about-modal" onClick={onClose}>
      <div className="about-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
};