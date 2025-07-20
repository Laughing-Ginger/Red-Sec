import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';

export const Header = ({ onShowHistory }) => {
  const { setShowAbout } = useContext(AppContext);
  return (
    <header>
      <div className="header-content">
        <h1>Red Sec</h1>
        <div className="header-actions">
          <button className="history-btn" onClick={onShowHistory}>History</button>
          <button className="about-btn" onClick={() => setShowAbout(true)}>About</button>
        </div>
      </div>
      <p className="subtitle">
        A <span className="highlight-sec">Sec</span>ure AI-powered <span className="highlight-sec">Red</span>action
      </p>
    </header>
  );
};
