import React from 'react';

export const ToggleSwitch = ({ id, label, checked, onChange }) => (
  <label htmlFor={id} className="toggle">
    <input id={id} type="checkbox" checked={checked} onChange={onChange} />
    <span className="toggle-slider"></span>
    {label}
  </label>
);