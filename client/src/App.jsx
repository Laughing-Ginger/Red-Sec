import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [redactedText, setRedactedText] = useState('');
  const [customPatterns, setCustomPatterns] = useState('');
  const [selectedEntities, setSelectedEntities] = useState({
    PER: true, ORG: true, LOC: true, MISC: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const entityTypes = [
    { id: 'PER', name: 'Persons' },
    { id: 'ORG', name: 'Organizations' },
    { id: 'LOC', name: 'Locations' },
    { id: 'MISC', name: 'Miscellaneous' }
  ];

  const handleRedactClick = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to redact');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/redact', {
        text: inputText,
        customPatterns: customPatterns.split(',').map(p => p.trim()).filter(p => p),
        entities: Object.keys(selectedEntities).filter(key => selectedEntities[key])
      });
      
      setRedactedText(response.data.redactedText);
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error redacting text:', err);
      setError('Failed to process text. Please try again.');
      setRedactedText('');
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEntityToggle = (entity) => {
    setSelectedEntities(prev => ({
      ...prev,
      [entity]: !prev[entity]
    }));
  };

  const downloadRedactedText = () => {
    const element = document.createElement('a');
    const file = new Blob([redactedText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'redacted-text.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const clearAll = () => {
    setInputText('');
    setRedactedText('');
    setCustomPatterns('');
    setStats(null);
    setError('');
  };

  return (
    <div className="App">
      <header>
        <h1>Sensitive Data Redactor</h1>
        <p className="subtitle">Protect sensitive information with AI-powered redaction</p>
      </header>

      <div className="main-container">
        <div className="input-section">
          <textarea
            placeholder="Paste sensitive text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          ></textarea>
          
          <div className="custom-patterns">
            <label>Custom Patterns (comma separated):</label>
            <input 
              type="text" 
              placeholder="e.g., credit card, social security, \d{3}-\d{2}-\d{4}"
              value={customPatterns}
              onChange={(e) => setCustomPatterns(e.target.value)}
            />
          </div>
          
          <div className="entity-selection">
            <h3>Redaction Targets:</h3>
            <div className="entity-toggles">
              {entityTypes.map(entity => (
                <label key={entity.id} className="toggle">
                  <input
                    type="checkbox"
                    checked={selectedEntities[entity.id]}
                    onChange={() => handleEntityToggle(entity.id)}
                  />
                  <span className="toggle-slider"></span>
                  {entity.name}
                </label>
              ))}
            </div>
          </div>
          
          <div className="controls">
            <button 
              onClick={handleRedactClick} 
              disabled={isLoading}
              className="primary"
            >
              {isLoading ? 'Redacting...' : 'Redact Text'}
            </button>
            <button onClick={clearAll} className="secondary">
              Clear All
            </button>
          </div>
        </div>
        
        <div className="output-section">
          <div className="section-header">
            <h2>Redacted Result</h2>
            {redactedText && (
              <button 
                onClick={downloadRedactedText}
                className="download-btn"
              >
                Download
              </button>
            )}
          </div>
          
          {error && <div className="error">{error}</div>}
          
          <div className="result-container">
            {redactedText ? (
              <pre>{redactedText}</pre>
            ) : (
              <div className="placeholder">
                {isLoading ? (
                  <div className="loader">Processing...</div>
                ) : (
                  <p>Your redacted text will appear here</p>
                )}
              </div>
            )}
          </div>
          
          {stats && (
            <div className="stats">
              <h3>Redaction Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.totalRedactions}</div>
                  <div className="stat-label">Total Redactions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.timeTaken}ms</div>
                  <div className="stat-label">Processing Time</div>
                </div>
              </div>
              
              <div className="entity-stats">
                <h4>By Entity Type:</h4>
                <ul>
                  {Object.entries(stats.entityCounts).map(([entity, count]) => (
                    <li key={entity}>
                      <span className="entity-name">{entity}:</span>
                      <span className="entity-count">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <footer>
        <p>Secure Data Redaction System | Built with React & Node.js</p>
      </footer>
    </div>
  );
}

export default App;