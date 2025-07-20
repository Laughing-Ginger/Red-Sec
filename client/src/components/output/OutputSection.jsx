import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useRedactor } from '../../hooks/useRedactor';

const renderRedactedText = text => {
  if (!text) return null;
  return text.split(/(\[.*?\])/g).map((part, index) => part.startsWith('[') && part.endsWith(']') ? <span key={index} className="redacted-entity">{part}</span> : part);
};

const ResultDisplay = () => {
  const { redactedText } = useContext(AppContext);
  const { isProcessing, error } = useRedactor();
  const downloadRedactedText = () => {
    if (!redactedText) return;
    const element = document.createElement('a');
    const blob = new Blob([redactedText], { type: 'text/plain' });
    element.href = URL.createObjectURL(blob);
    element.download = 'redacted-text.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  return (
    <>
      <div className="section-header">
        <h2>Redaction Result</h2>
        {redactedText && <button onClick={downloadRedactedText} className="download-btn">Download</button>}
      </div>
      {error && <div className="error">{error}</div>}
      <div className="result-container">
        {isProcessing ? <div className="loader">Processing...</div> : 
         redactedText ? <div className="redacted-output">{renderRedactedText(redactedText)}</div> : 
         <div className="placeholder"><p>Your redacted content will appear here</p></div>
        }
      </div>
    </>
  );
};

const StatsDisplay = () => {
    const { stats } = useContext(AppContext);
    if (!stats) return null;
    return (
        <div className="stats">
            <h3>Redaction Statistics</h3>
            <div className="stats-grid">
                <div className="stat-card"><div className="stat-value">{stats.totalRedactions}</div><div className="stat-label">Total Redactions</div></div>
                <div className="stat-card"><div className="stat-value">{stats.timeTaken}ms</div><div className="stat-label">Processing Time</div></div>
            </div>
            <div className="entity-stats">
                <h4>By Entity Type:</h4>
                <ul>{Object.entries(stats.entityCounts).map(([entity, count]) => (count > 0 && <li key={entity}><span className="entity-name">{entity}</span><span className="entity-count">{count}</span></li>))}</ul>
            </div>
        </div>
    );
};

const EntityLegend = () => {
    const { entityTypes } = useContext(AppContext);
    return (
        <div className="entity-legend">
            <h3>Legend</h3>
            <ul>
                {entityTypes.map(entity => <li key={entity.id}><strong>{entity.name} ({entity.id}):</strong> {entity.description}</li>)}
                <li><strong>CUSTOM:</strong> Matches from your custom patterns.</li>
            </ul>
        </div>
    );
};

export const OutputSection = () => (
    <div className="output-section">
        <ResultDisplay />
        <StatsDisplay />
        <EntityLegend />
    </div>
);